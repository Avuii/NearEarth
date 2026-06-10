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
        if (string.IsNullOrWhiteSpace(settings.Email))
        {
            return BadRequest(new
            {
                message = "Email is required"
            });
        }

        if (settings.Language != "pl" && settings.Language != "en")
        {
            settings.Language = "en";
        }

        if (settings.Days < 1 || settings.Days > 30)
        {
            return BadRequest(new
            {
                message = "Days must be between 1 and 30"
            });
        }

        if (settings.MaxEmailsPerCheck < 1 || settings.MaxEmailsPerCheck > 20)
        {
            settings.MaxEmailsPerCheck = 10;
        }

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