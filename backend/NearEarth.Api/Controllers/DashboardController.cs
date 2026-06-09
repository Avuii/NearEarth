using Microsoft.AspNetCore.Mvc;
using NearEarth.Api.Services;

namespace NearEarth.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly DashboardService _dashboardService;

    public DashboardController(DashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboard([FromQuery] string? startDate, [FromQuery] string? endDate)
    {
        var today = DateTime.UtcNow.Date;

        if (string.IsNullOrWhiteSpace(startDate))
        {
            startDate = today.ToString("yyyy-MM-dd");
        }

        if (string.IsNullOrWhiteSpace(endDate))
        {
            endDate = today.AddDays(7).ToString("yyyy-MM-dd");
        }

        if (!DateTime.TryParse(startDate, out var parsedStartDate))
        {
            return BadRequest(new
            {
                message = "startDate must use yyyy-MM-dd format"
            });
        }

        if (!DateTime.TryParse(endDate, out var parsedEndDate))
        {
            return BadRequest(new
            {
                message = "endDate must use yyyy-MM-dd format"
            });
        }

        if (parsedEndDate < parsedStartDate)
        {
            return BadRequest(new
            {
                message = "endDate cannot be earlier than startDate"
            });
        }

        if ((parsedEndDate - parsedStartDate).TotalDays > 7)
        {
            return BadRequest(new
            {
                message = "NASA NeoWs feed supports a maximum range of 7 days"
            });
        }

        try
        {
            var result = await _dashboardService.GetDashboardAsync(startDate, endDate);
            return Ok(result);
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(502, new
            {
                message = "NASA NeoWs request failed",
                details = ex.Message
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Dashboard data could not be generated",
                details = ex.Message
            });
        }
    }
}