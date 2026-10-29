using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using NearEarth.Api.Models.Alerts;
using NearEarth.Api.Models.Nasa;
using NearEarth.Api.Options;
using NearEarth.Api.Services;
using Xunit;

namespace NearEarth.Api.Tests;

public class AutomaticAlertTests : IDisposable
{
    private readonly string _directory = Path.Combine(Path.GetTempPath(), "NearEarth-alert-tests-" + Guid.NewGuid().ToString("N"));
    private string SubscriptionsPath => Path.Combine(_directory, "subscriptions.json");
    private string HistoryPath => Path.Combine(_directory, "history.json");

    [Fact]
    public void SavedSettingsAndDisabledStateSurviveRestart()
    {
        var store = new AlertSubscriptionStore(SubscriptionsPath);
        var settings = Settings("viewer@example.org");
        settings.Language = "pl";
        settings.VeryCloseMaxLd = 3;
        settings.StartDate = "2020-01-01";
        var saved = store.Save(null, settings)!;
        var restored = new AlertSubscriptionStore(SubscriptionsPath).Get(saved.Id)!;

        Assert.Equal("viewer@example.org", restored.Settings.Email);
        Assert.Equal("pl", restored.Settings.Language);
        Assert.Equal(3, restored.Settings.VeryCloseMaxLd);
        Assert.Null(restored.Settings.StartDate);
        Assert.True(restored.Enabled);
        restored.Settings.Email = "mutated@example.com";
        Assert.Equal("viewer@example.org", store.Get(saved.Id)!.Settings.Email);

        Assert.True(store.Disable(saved.Id));
        var restarted = new AlertSubscriptionStore(SubscriptionsPath);
        Assert.False(restarted.Get(saved.Id)!.Enabled);
        Assert.Empty(restarted.GetDue(DateTime.UtcNow, TimeSpan.FromMinutes(15)));
        Assert.Equal(Timeout.InfiniteTimeSpan, restarted.GetNextDelay(DateTime.UtcNow, TimeSpan.FromMinutes(15)));
    }

    [Fact]
    public async Task SavingASubscriptionWakesTheWaitingWorker()
    {
        var store = new AlertSubscriptionStore(SubscriptionsPath);
        using var cancellation = new CancellationTokenSource(TimeSpan.FromSeconds(5));
        var waiting = store.WaitForChangeAsync(Timeout.InfiniteTimeSpan, cancellation.Token);
        store.Save(null, Settings("viewer@example.com"));
        Assert.True(await waiting);
    }

    [Fact]
    public async Task HostedWorkerSendsSavedAlertsWithoutAnyBrowserRequest()
    {
        var store = new AlertSubscriptionStore(SubscriptionsPath);
        var history = new NotificationHistoryService(HistoryPath);
        var delivered = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var handler = new StubHandler(request =>
        {
            if (request.RequestUri!.Host == "nasa.example") return Task.FromResult(Feed());
            delivered.TrySetResult();
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent("{\"id\":\"confirmed\"}") });
        });
        await using var services = new ServiceCollection()
            .AddScoped(_ => Processor(store, handler, history)).BuildServiceProvider();
        using var worker = new AutomaticAlertWorker(services.GetRequiredService<IServiceScopeFactory>(), store,
            new ConfigurationBuilder().Build(), NullLogger<AutomaticAlertWorker>.Instance);

        await worker.StartAsync(CancellationToken.None);
        var saved = store.Save(null, Settings("viewer@example.org"))!;
        await delivered.Task.WaitAsync(TimeSpan.FromSeconds(5));
        await worker.StopAsync(CancellationToken.None);

        Assert.NotNull(store.Get(saved.Id)!.LastSentAtUtc);
        Assert.Single(history.GetHistory());
    }

    [Fact]
    public async Task AutomaticChecksUseEachRecipientsRulesAndShareFreshNasaData()
    {
        var store = new AlertSubscriptionStore(SubscriptionsPath);
        var first = store.Save(null, Settings("first@example.com"))!;
        var secondSettings = Settings("second@example.org");
        secondSettings.EnableVeryClose = false;
        secondSettings.EnableLargeObject = true;
        var second = store.Save(null, secondSettings)!;
        var nonMatching = Settings("unmatched@example.net");
        nonMatching.EnableVeryClose = false;
        nonMatching.EnablePotentiallyHazardous = true;
        var third = store.Save(null, nonMatching)!;
        var recipients = new List<string>();
        var nasaCalls = 0;
        var handler = Handler(recipients, () => nasaCalls++);
        var processor = Processor(store, handler, new NotificationHistoryService(HistoryPath));

        await processor.CheckDueAsync(TimeSpan.FromMinutes(15), CancellationToken.None);
        Assert.Equal(new[] { "first@example.com", "second@example.org" }, recipients);
        Assert.Equal(1, nasaCalls);
        Assert.NotNull(store.Get(first.Id)!.LastSentAtUtc);
        Assert.NotNull(store.Get(second.Id)!.LastSentAtUtc);
        Assert.NotNull(store.Get(third.Id)!.LastCheckedAtUtc);
        Assert.Null(store.Get(third.Id)!.LastSentAtUtc);

        await processor.CheckDueAsync(TimeSpan.FromMinutes(15), CancellationToken.None);
        Assert.Equal(1, nasaCalls);
        Assert.Equal(2, recipients.Count);
    }

    [Fact]
    public async Task RestartDoesNotResendAlreadyDeliveredAlerts()
    {
        var store = new AlertSubscriptionStore(SubscriptionsPath);
        store.Save(null, Settings("viewer@example.org"));
        var recipients = new List<string>();
        var handler = Handler(recipients);
        await Processor(store, handler, new NotificationHistoryService(HistoryPath)).CheckDueAsync(TimeSpan.Zero, CancellationToken.None);

        var restoredStore = new AlertSubscriptionStore(SubscriptionsPath);
        var restoredHistory = new NotificationHistoryService(HistoryPath);
        await Processor(restoredStore, handler, restoredHistory).CheckDueAsync(TimeSpan.Zero, CancellationToken.None);

        Assert.Single(recipients);
        Assert.Single(restoredHistory.GetHistory());
    }

    [Fact]
    public async Task FailedEmailsRemainRetryableAndStatusShowsTheFailure()
    {
        var store = new AlertSubscriptionStore(SubscriptionsPath);
        var saved = store.Save(null, Settings("viewer@example.com"))!;
        var fail = true;
        var history = new NotificationHistoryService(HistoryPath);
        var handler = new StubHandler(request => Task.FromResult(request.RequestUri!.Host == "nasa.example" ? Feed() :
            new HttpResponseMessage(fail ? HttpStatusCode.ServiceUnavailable : HttpStatusCode.OK)
            {
                Content = new StringContent(fail ? "{\"message\":\"Try again\"}" : "{\"id\":\"confirmed\"}")
            }));
        var processor = Processor(store, handler, history);

        await processor.CheckDueAsync(TimeSpan.Zero, CancellationToken.None);
        Assert.Equal("Try again", store.Get(saved.Id)!.LastError);
        Assert.Null(store.Get(saved.Id)!.LastSentAtUtc);
        Assert.Empty(history.GetHistory());
        fail = false;
        await processor.CheckDueAsync(TimeSpan.Zero, CancellationToken.None);
        Assert.Null(store.Get(saved.Id)!.LastError);
        Assert.NotNull(store.Get(saved.Id)!.LastSentAtUtc);
        Assert.Single(history.GetHistory());
    }

    [Fact]
    public async Task DisablingDuringDataFetchPreventsPendingEmails()
    {
        var store = new AlertSubscriptionStore(SubscriptionsPath);
        var saved = store.Save(null, Settings("viewer@example.com"))!;
        var recipients = new List<string>();
        var handler = Handler(recipients, () => store.Disable(saved.Id));
        await Processor(store, handler, new NotificationHistoryService(HistoryPath)).CheckDueAsync(TimeSpan.Zero, CancellationToken.None);
        Assert.Empty(recipients);
        Assert.False(store.Get(saved.Id)!.Enabled);
    }

    [Fact]
    public async Task ConcurrentManualChecksDoNotSendDuplicateEmails()
    {
        var history = new NotificationHistoryService(HistoryPath);
        var handler = new StubHandler(async _ =>
        {
            await Task.Delay(30);
            return new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent("{\"id\":\"confirmed\"}") };
        });
        var sender = Sender(handler);
        var alerts = new List<NeoAlert> { new() { AlertId = "same-alert" } };
        var results = await Task.WhenAll(
            new NotificationService(sender, history).SendEmailAlertsAsync(alerts, Settings("viewer@example.com")),
            new NotificationService(sender, history).SendEmailAlertsAsync(alerts, Settings("VIEWER@example.com")));

        Assert.Equal(1, handler.Calls);
        Assert.Single(results.SelectMany(result => result), result => result.Skipped);
    }

    [Fact]
    public async Task CancelledChecksDoNotSendEmailsOrAdvanceTheLastCheck()
    {
        var store = new AlertSubscriptionStore(SubscriptionsPath);
        var saved = store.Save(null, Settings("viewer@example.com"))!;
        var recipients = new List<string>();
        using var cancellation = new CancellationTokenSource();
        cancellation.Cancel();
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() =>
            Processor(store, Handler(recipients), new NotificationHistoryService(HistoryPath))
                .CheckDueAsync(TimeSpan.Zero, cancellation.Token));
        Assert.Empty(recipients);
        Assert.Null(store.Get(saved.Id)!.LastCheckedAtUtc);
    }

    private static EmailAlertSettings Settings(string email) => new()
    {
        Email = email, EnableVeryClose = true, EnableLargeObject = false,
        EnablePotentiallyHazardous = false, MaxEmailsPerCheck = 1
    };

    private static EmailNotificationSender Sender(StubHandler handler) => new(new HttpClient(handler),
        new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { ["Email:ResendApiKey"] = "test-key" }).Build());

    private static AutomaticAlertProcessor Processor(AlertSubscriptionStore store, StubHandler handler, NotificationHistoryService history) => new(
        store,
        new DashboardService(new NasaNeoWsService(new HttpClient(handler), new MemoryCache(new MemoryCacheOptions()),
            Microsoft.Extensions.Options.Options.Create(new NasaOptions { BaseUrl = "https://nasa.example", ApiKey = "test-key" }))),
        new AlertEvaluationService(), new NotificationService(Sender(handler), history), NullLogger<AutomaticAlertProcessor>.Instance);

    private static StubHandler Handler(List<string> recipients, Action? nasaCalled = null) => new(async request =>
    {
        if (request.RequestUri!.Host == "nasa.example")
        {
            nasaCalled?.Invoke();
            return Feed();
        }
        using var body = JsonDocument.Parse(await request.Content!.ReadAsStringAsync());
        recipients.Add(body.RootElement.GetProperty("to")[0].GetString()!);
        return new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent("{\"id\":\"confirmed\"}") };
    });

    private static HttpResponseMessage Feed()
    {
        var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
        var data = new NasaFeedResponse
        {
            NearEarthObjects = new() { [today] = [new NasaNeoObject
            {
                Id = "test-neo", Name = "Test asteroid",
                EstimatedDiameter = new NasaEstimatedDiameter { Meters = new NasaEstimatedDiameterRange { EstimatedDiameterMin = 400, EstimatedDiameterMax = 400 } },
                CloseApproachData = [new NasaCloseApproachData { CloseApproachDate = today,
                    MissDistance = new NasaMissDistance { Lunar = "1.5", Kilometers = "576600" } }]
            }] }
        };
        return new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent(JsonSerializer.Serialize(data)) };
    }

    public void Dispose()
    {
        if (File.Exists(SubscriptionsPath)) File.Delete(SubscriptionsPath);
        if (File.Exists(HistoryPath)) File.Delete(HistoryPath);
        if (Directory.Exists(_directory)) Directory.Delete(_directory);
    }
}
