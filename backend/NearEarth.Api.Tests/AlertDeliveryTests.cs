using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using NearEarth.Api.Models.Alerts;
using NearEarth.Api.Services;
using Xunit;

namespace NearEarth.Api.Tests;

public class AlertDeliveryTests
{
    [Fact]
    public async Task SendingUsesProviderEvenWithLegacyMockSetting()
    {
        var handler = new StubHandler(async request =>
        {
            Assert.Equal("https://api.resend.com/emails", request.RequestUri!.ToString());
            Assert.Equal("Bearer", request.Headers.Authorization!.Scheme);
            var body = JsonDocument.Parse(await request.Content!.ReadAsStringAsync()).RootElement;
            Assert.Equal("viewer@example.com", body.GetProperty("to")[0].GetString());
            Assert.Contains("bardzo bliski", body.GetProperty("subject").GetString());
            Assert.Contains("&lt;asteroid&gt;", body.GetProperty("html").GetString());
            return Response(HttpStatusCode.OK, "{\"id\":\"provider-confirmation\"}");
        });

        var result = await Sender(handler).SendAsync(
            new NeoAlert { AlertId = "first", ObjectName = "<asteroid>", RuleType = AlertRuleType.VeryClose },
            "viewer@example.com", "pl");

        Assert.True(result.Success);
        Assert.Equal(1, handler.Calls);
    }

    [Theory]
    [InlineData(HttpStatusCode.Forbidden, "{\"message\":\"Recipient is not permitted\"}", "Recipient is not permitted")]
    [InlineData(HttpStatusCode.TooManyRequests, "rate limited", "HTTP 429")]
    [InlineData(HttpStatusCode.OK, "{}", "did not confirm")]
    public async Task UnconfirmedDeliveryIsNotRecordedAsSent(HttpStatusCode status, string body, string error)
    {
        var handler = new StubHandler(_ => Task.FromResult(Response(status, body)));
        var history = new NotificationHistoryService();
        var service = new NotificationService(Sender(handler), history);

        var result = Assert.Single(await service.SendEmailAlertsAsync(
            [new NeoAlert { AlertId = "first" }], Settings()));

        Assert.False(result.Success);
        Assert.Contains(error, result.Message);
        Assert.Empty(history.GetHistory());
    }

    [Fact]
    public async Task NetworkFailureCanBeRetried()
    {
        var handler = new StubHandler(_ => throw new HttpRequestException("Offline"));
        var history = new NotificationHistoryService();
        var service = new NotificationService(Sender(handler), history);
        var alerts = new List<NeoAlert> { new() { AlertId = "first" } };

        Assert.False(Assert.Single(await service.SendEmailAlertsAsync(alerts, Settings())).Success);
        Assert.False(Assert.Single(await service.SendEmailAlertsAsync(alerts, Settings())).Success);
        Assert.Equal(2, handler.Calls);
        Assert.Empty(history.GetHistory());
    }

    [Fact]
    public async Task SkippedAlertsDoNotConsumeTheSendLimit()
    {
        var handler = new StubHandler(_ => Task.FromResult(Response(HttpStatusCode.OK, "{\"id\":\"confirmed\"}")));
        var history = new NotificationHistoryService();
        var service = new NotificationService(Sender(handler), history);
        var alerts = new List<NeoAlert> { new() { AlertId = "first" }, new() { AlertId = "second" } };

        Assert.True(Assert.Single(await service.SendEmailAlertsAsync(alerts, Settings())).Success);
        var nextCheck = await service.SendEmailAlertsAsync(alerts, Settings());

        Assert.True(nextCheck[0].Skipped);
        Assert.Equal("second", nextCheck[1].AlertId);
        Assert.True(nextCheck[1].Success);
        Assert.Equal(2, handler.Calls);
        Assert.Equal(2, history.GetHistory().Count);
    }

    [Fact]
    public async Task MissingApiKeyNeverReportsSuccess()
    {
        var handler = new StubHandler(_ => throw new Exception("Must not call provider"));
        var result = await Sender(handler, "").SendAsync(new NeoAlert(), "viewer@example.com", "en");
        Assert.False(result.Success);
        Assert.Equal(0, handler.Calls);
    }

    [Fact]
    public async Task EachRecipientReceivesTheirOwnCopyOfTheSameAlert()
    {
        var recipients = new List<string>();
        var handler = new StubHandler(async request =>
        {
            using var body = JsonDocument.Parse(await request.Content!.ReadAsStringAsync());
            recipients.Add(body.RootElement.GetProperty("to")[0].GetString()!);
            return Response(HttpStatusCode.OK, "{\"id\":\"confirmed\"}");
        });
        var service = new NotificationService(Sender(handler), new NotificationHistoryService());
        var alerts = new List<NeoAlert> { new() { AlertId = "same-alert" } };

        foreach (var recipient in new[] { "first@example.com", "second@example.org" })
        {
            var settings = Settings();
            settings.Email = recipient;
            var result = Assert.Single(await service.SendEmailAlertsAsync(alerts, settings));
            Assert.True(result.Success);
            Assert.False(result.Skipped);
        }

        Assert.Equal(new[] { "first@example.com", "second@example.org" }, recipients);
    }

    [Theory]
    [InlineData("", "abcdefghijklmnop", "587", "Nie skonfigurowano")]
    [InlineData("sender@gmail.com", "", "587", "Nie skonfigurowano")]
    [InlineData("sender@gmail.com", "abcdefghijklmnop", "0", "Nieprawidłowa konfiguracja")]
    [InlineData("sender@gmail.com", "abcdefghijklmnop", "invalid", "Nieprawidłowa konfiguracja")]
    public async Task InvalidSmtpConfigurationNeverReportsSuccess(string username, string password, string port, string error)
    {
        var handler = new StubHandler(_ => throw new Exception("SMTP must not call Resend"));
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Email:Provider"] = "Smtp",
            ["Email:Smtp:Username"] = username,
            ["Email:Smtp:Password"] = password,
            ["Email:Smtp:Port"] = port
        }).Build();

        var result = await new EmailNotificationSender(new HttpClient(handler), config)
            .SendAsync(new NeoAlert { AlertId = "smtp-alert" }, "viewer@example.com", "pl");

        Assert.False(result.Success);
        Assert.Equal("smtp-alert", result.AlertId);
        Assert.Contains(error, result.Message);
        Assert.Equal(0, handler.Calls);
    }

    private static EmailAlertSettings Settings() => new() { Email = "viewer@example.com", MaxEmailsPerCheck = 1 };

    private static EmailNotificationSender Sender(StubHandler handler, string apiKey = "test-key") => new(
        new HttpClient(handler),
        new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Email:Mode"] = "Mock",
            ["Email:ResendApiKey"] = apiKey,
            ["Email:From"] = "NearEarth <onboarding@resend.dev>"
        }).Build());

    private static HttpResponseMessage Response(HttpStatusCode status, string body) => new(status) { Content = new StringContent(body) };
}

internal sealed class StubHandler(Func<HttpRequestMessage, Task<HttpResponseMessage>> respond) : HttpMessageHandler
{
    public int Calls { get; private set; }

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        Calls++;
        return respond(request);
    }
}
