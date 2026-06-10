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
        EmailAlertSettings settings)
    {
        var results = new List<NotificationResult>();

        foreach (var alert in alerts.Take(settings.MaxEmailsPerCheck))
        {
            var key = $"{settings.Email}_{alert.AlertId}";

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

            var result = await _emailSender.SendAsync(alert, settings.Email, settings.Language);

            results.Add(result);

            if (result.Success)
            {
                _historyService.MarkAsSent(key, alert);
            }
        }

        return results;
    }
}