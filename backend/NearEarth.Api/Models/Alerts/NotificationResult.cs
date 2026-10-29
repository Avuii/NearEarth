namespace NearEarth.Api.Models.Alerts;

public class NotificationResult
{
    public bool Success { get; set; }
    public bool Skipped { get; set; }
    public string AlertId { get; set; } = "";
    public string Message { get; set; } = "";
}
