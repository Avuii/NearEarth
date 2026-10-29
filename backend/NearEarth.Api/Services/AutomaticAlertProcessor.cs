using NearEarth.Api.Models.Dashboard;

namespace NearEarth.Api.Services;

public class AutomaticAlertProcessor(
    AlertSubscriptionStore subscriptions,
    DashboardService dashboardService,
    AlertEvaluationService evaluationService,
    NotificationService notificationService,
    ILogger<AutomaticAlertProcessor> logger)
{
    public async Task CheckDueAsync(TimeSpan interval, CancellationToken cancellationToken)
    {
        var feeds = new Dictionary<int, Task<DashboardResponse>>();
        foreach (var subscription in subscriptions.GetDue(DateTime.UtcNow, interval))
        {
            cancellationToken.ThrowIfCancellationRequested();
            try
            {
                var settings = subscription.Settings;
                if (!feeds.TryGetValue(settings.Days, out var feed))
                {
                    feed = dashboardService.GetDashboardRangeAsync(DateTime.UtcNow.ToString("yyyy-MM-dd"), settings.Days,
                        forceRefresh: true, cancellationToken: cancellationToken);
                    feeds.Add(settings.Days, feed);
                }

                var dashboard = await feed;
                var current = subscriptions.Get(subscription.Id);
                if (current == null || !current.Enabled || current.UpdatedAtUtc != subscription.UpdatedAtUtc) continue;

                var alerts = evaluationService.Evaluate(dashboard, settings);
                var results = await notificationService.SendEmailAlertsAsync(alerts, settings, cancellationToken, () =>
                {
                    var latest = subscriptions.Get(subscription.Id);
                    return latest?.Enabled == true && latest.UpdatedAtUtc == subscription.UpdatedAtUtc;
                });
                var error = results.FirstOrDefault(result => !result.Success)?.Message;
                subscriptions.CompleteCheck(subscription, results.Any(result => result.Success && !result.Skipped), error);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception)
            {
                logger.LogWarning("Automatic email alert check failed for subscription {SubscriptionId}.", subscription.Id);
                subscriptions.CompleteCheck(subscription, false, subscription.Settings.Language == "pl"
                    ? "Nie udało się sprawdzić alertów. Kolejna próba nastąpi automatycznie."
                    : "Could not check alerts. The next attempt will run automatically.");
            }
        }
    }
}
