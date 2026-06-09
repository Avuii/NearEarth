using Microsoft.AspNetCore.Mvc;
using NearEarth.Api.Services;

namespace NearEarth.Api.Controllers;

[ApiController]
[Route("api/neos")]
public class NeoController : ControllerBase
{
    private readonly NasaNeoWsService _nasaNeoWsService;

    public NeoController(NasaNeoWsService nasaNeoWsService)
    {
        _nasaNeoWsService = nasaNeoWsService;
    }

    [HttpGet("feed")]
    public async Task<IActionResult> GetFeed([FromQuery] string startDate, [FromQuery] string endDate)
    {
        if (string.IsNullOrWhiteSpace(startDate) || string.IsNullOrWhiteSpace(endDate))
        {
            return BadRequest(new
            {
                message = "startDate and endDate are required"
            });
        }

        var data = await _nasaNeoWsService.GetFeedAsync(startDate, endDate);

        return Content(data, "application/json");
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetAsteroid(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            return BadRequest(new
            {
                message = "Asteroid id is required"
            });
        }

        var data = await _nasaNeoWsService.GetAsteroidAsync(id);

        return Content(data, "application/json");
    }

    [HttpGet("browse")]
    public async Task<IActionResult> Browse([FromQuery] int page = 0, [FromQuery] int size = 20)
    {
        if (page < 0)
        {
            return BadRequest(new
            {
                message = "Page cannot be lower than 0"
            });
        }

        if (size < 1 || size > 100)
        {
            return BadRequest(new
            {
                message = "Size must be between 1 and 100"
            });
        }

        var data = await _nasaNeoWsService.BrowseAsteroidsAsync(page, size);

        return Content(data, "application/json");
    }
}