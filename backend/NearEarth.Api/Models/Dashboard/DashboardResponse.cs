namespace NearEarth.Api.Models.Dashboard;

public class DashboardResponse
{
    public string StartDate { get; set; } = "";
    public string EndDate { get; set; } = "";
    public DateTime GeneratedAtUtc { get; set; }
    public DateTime LastSyncedAtUtc { get; set; }
    public DashboardSummaryCard Summary { get; set; } = new();
    public DashboardNeoItem? ClosestObject { get; set; }
    public DashboardNeoItem? FastestObject { get; set; }
    public DashboardNeoItem? LargestObject { get; set; }
    public List<DailyApproachCount> DailyApproaches { get; set; } = new();
    public List<DashboardNeoItem> Objects { get; set; } = new();
}
