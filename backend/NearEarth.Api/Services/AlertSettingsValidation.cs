using System.ComponentModel.DataAnnotations;
using NearEarth.Api.Models.Alerts;

namespace NearEarth.Api.Services;

public static class AlertSettingsValidation
{
    public static string? Normalize(EmailAlertSettings settings)
    {
        settings.Email = settings.Email?.Trim() ?? "";
        if (!new EmailAddressAttribute().IsValid(settings.Email) || string.IsNullOrWhiteSpace(settings.Email))
            return "A valid email address is required";
        if (settings.Language != "pl" && settings.Language != "en") settings.Language = "en";
        if (settings.Days < 1 || settings.Days > 30) return "Days must be between 1 and 30";
        if (!double.IsFinite(settings.VeryCloseMaxLd) || settings.VeryCloseMaxLd <= 0 ||
            !double.IsFinite(settings.LargeMinDiameterMeters) || settings.LargeMinDiameterMeters <= 0)
            return "Alert thresholds must be positive numbers";
        if (settings.MaxEmailsPerCheck < 1 || settings.MaxEmailsPerCheck > 20) settings.MaxEmailsPerCheck = 10;
        return null;
    }
}
