using Microsoft.AspNetCore.Mvc;
using NearEarth.Api.Models.Alerts;
using NearEarth.Api.Services;

namespace NearEarth.Api.Controllers;

[ApiController]
[Route("api/alerts")]
public class AlertsController : ControllerBase
{
    private readonly DashboardService _dashboardService;
    private readonly AlertEvaluationService _alertEvaluationService;
    private readonly NotificationService _notificationService;
    private readonly NotificationHistoryService _historyService;

    public AlertsController(
        DashboardService dashboardService,
        AlertEvaluationService alertEvaluationService,
        NotificationService notificationService,
        NotificationHistoryService historyService)
    {
        _dashboardService = dashboardService;
        _alertEvaluationService = alertEvaluationService;
        _notificationService = notificationService;
        _historyService = historyService;
    }

    [HttpPost("check")]
    public async Task<IActionResult> CheckAlerts([FromBody] EmailAlertSettings settings)
    {
        var error = AlertSettingsValidation.Normalize(settings);
        if (error != null) return BadRequest(new { message = error });

        var startDate = settings.StartDate;

        if (string.IsNullOrWhiteSpace(startDate))
        {
            startDate = DateTime.UtcNow.Date.ToString("yyyy-MM-dd");
        }

        if (!DateTime.TryParse(startDate, out var parsedStartDate))
        {
            return BadRequest(new
            {
                message = "StartDate must use yyyy-MM-dd format"
            });
        }

        var dashboard = await _dashboardService.GetDashboardRangeAsync(
            parsedStartDate.ToString("yyyy-MM-dd"),
            settings.Days
        );

        var alerts = _alertEvaluationService.Evaluate(dashboard, settings);
        var results = await _notificationService.SendEmailAlertsAsync(alerts, settings);

        var response = new AlertCheckResponse
        {
            TotalAlertsFound = alerts.Count,
            SentCount = results.Count(x => x.Success && !x.Skipped),
            SkippedCount = results.Count(x => x.Skipped),
            LastSyncedAtUtc = dashboard.LastSyncedAtUtc,
            Alerts = alerts,
            Results = results
        };

        return Ok(response);
    }

    [HttpGet("history")]
    public IActionResult GetHistory()
    {
        return Ok(_historyService.GetHistory());
    }
}
