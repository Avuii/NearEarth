using NearEarth.Api.Models.Alerts;

namespace NearEarth.Api.Services;

public class NotificationService
{
    private readonly EmailNotificationSender _emailSender;
    private readonly NotificationHistoryService _historyService;

    public NotificationService(
        EmailNotificationSender emailSender,
        NotificationHistoryService historyService)
    {
        _emailSender = emailSender;
        _historyService = historyService;
    }

    public async Task<List<NotificationResult>> SendEmailAlertsAsync(
        List<NeoAlert> alerts,
        EmailAlertSettings settings,
        CancellationToken cancellationToken = default,
        Func<bool>? shouldContinue = null)
    {
        await _historyService.DeliveryLock.WaitAsync(cancellationToken);
        try
        {
            return await SendPendingAlertsAsync(alerts, settings, cancellationToken, shouldContinue);
        }
        finally
        {
            _historyService.DeliveryLock.Release();
        }
    }

    private async Task<List<NotificationResult>> SendPendingAlertsAsync(
        List<NeoAlert> alerts,
        EmailAlertSettings settings,
        CancellationToken cancellationToken,
        Func<bool>? shouldContinue)
    {
        var results = new List<NotificationResult>();

        var attemptedCount = 0;

        foreach (var alert in alerts)
        {
            cancellationToken.ThrowIfCancellationRequested();
            if (shouldContinue != null && !shouldContinue()) break;
            if (attemptedCount >= settings.MaxEmailsPerCheck)
            {
                break;
            }

            var key = $"{settings.Email.Trim().ToLowerInvariant()}_{alert.AlertId}";

            if (_historyService.WasSent(key))
            {
                results.Add(new NotificationResult
                {
                    Success = true,
                    Skipped = true,
                    AlertId = alert.AlertId,
                    Message = "Alert already sent"
                });

                continue;
            }

            if (attemptedCount > 0)
            {
                await Task.Delay(TimeSpan.FromSeconds(1), cancellationToken);
            }

            attemptedCount++;
            if (shouldContinue != null && !shouldContinue()) break;
            var result = await _emailSender.SendAsync(alert, settings.Email, settings.Language, cancellationToken);

            results.Add(result);

            if (result.Success)
            {
                _historyService.MarkAsSent(key, alert);
            }
        }

        return results;
    }
}
