using Microsoft.AspNetCore.Mvc;
using NearEarth.Api.Models.Alerts;
using NearEarth.Api.Services;

namespace NearEarth.Api.Controllers;

[ApiController]
[Route("api/alerts/subscriptions")]
public class AlertSubscriptionsController(AlertSubscriptionStore subscriptions, IConfiguration configuration) : ControllerBase
{
    [HttpGet("{id:guid}")]
    public IActionResult Get(Guid id)
    {
        var subscription = subscriptions.Get(id);
        return subscription == null ? NotFound() : Ok(ToResponse(subscription));
    }

    [HttpPost]
    public IActionResult Create([FromBody] EmailAlertSettings settings) => Save(null, settings);

    [HttpPut("{id:guid}")]
    public IActionResult Update(Guid id, [FromBody] EmailAlertSettings settings) => Save(id, settings);

    [HttpDelete("{id:guid}")]
    public IActionResult Disable(Guid id) => subscriptions.Disable(id) ? NoContent() : NotFound();

    private IActionResult Save(Guid? id, EmailAlertSettings settings)
    {
        var error = AlertSettingsValidation.Normalize(settings);
        if (error != null) return BadRequest(new { message = error });
        if (!settings.EnableVeryClose && !settings.EnableLargeObject && !settings.EnablePotentiallyHazardous)
            return BadRequest(new { message = "Enable at least one alert rule" });

        var subscription = subscriptions.Save(id, settings);
        return subscription == null ? NotFound() : Ok(ToResponse(subscription));
    }

    private object ToResponse(AlertSubscription subscription) => new
    {
        subscription.Id,
        subscription.Settings,
        subscription.Enabled,
        subscription.LastCheckedAtUtc,
        subscription.LastSentAtUtc,
        subscription.LastError,
        CheckIntervalMinutes = Math.Clamp(configuration.GetValue("Email:CheckIntervalMinutes", 15), 1, 1440)
    };
}
