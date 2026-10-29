namespace NearEarth.Api.Models.Alerts;

public class AlertCheckResponse
{
    public int TotalAlertsFound { get; set; }
    public int SentCount { get; set; }
    public int SkippedCount { get; set; }
    public DateTime LastSyncedAtUtc { get; set; }
    public List<NeoAlert> Alerts { get; set; } = new();
    public List<NotificationResult> Results { get; set; } = new();
}
