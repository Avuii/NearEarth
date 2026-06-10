using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using NearEarth.Api.Models.Alerts;

namespace NearEarth.Api.Services;

public class EmailNotificationSender
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public EmailNotificationSender(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<NotificationResult> SendAsync(NeoAlert alert, string toEmail, string language)
    {
        var mode = _configuration["Email:Mode"] ?? "Mock";

        if (mode.Equals("Mock", StringComparison.OrdinalIgnoreCase))
        {
            return new NotificationResult
            {
                Success = true,
                MockMode = true,
                AlertId = alert.AlertId,
                Message = $"Mock email generated for {toEmail}"
            };
        }

        var provider = _configuration["Email:Provider"] ?? "Resend";

        if (provider.Equals("Resend", StringComparison.OrdinalIgnoreCase))
        {
            return await SendWithResendAsync(alert, toEmail, language);
        }

        return new NotificationResult
        {
            Success = false,
            AlertId = alert.AlertId,
            Message = "Unsupported email provider"
        };
    }

    private async Task<NotificationResult> SendWithResendAsync(NeoAlert alert, string toEmail, string language)
    {
        var apiKey = _configuration["Email:ResendApiKey"] ?? "";
        var from = _configuration["Email:From"] ?? "NearEarth <onboarding@resend.dev>";

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return new NotificationResult
            {
                Success = false,
                AlertId = alert.AlertId,
                Message = "Missing Resend API key"
            };
        }

        var subject = BuildSubject(alert, language);
        var text = BuildTextBody(alert, language);
        var html = BuildHtmlBody(alert, language);

        var payload = new
        {
            from,
            to = new[] { toEmail },
            subject,
            html,
            text
        };

        var json = JsonSerializer.Serialize(payload);

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        request.Headers.UserAgent.ParseAdd("NearEarth.Api/1.0");
        request.Content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            return new NotificationResult
            {
                Success = false,
                AlertId = alert.AlertId,
                Message = content
            };
        }

        return new NotificationResult
        {
            Success = true,
            AlertId = alert.AlertId,
            Message = "Email sent"
        };
    }

    private string BuildSubject(NeoAlert alert, string language)
    {
        if (language == "pl")
        {
            return alert.RuleType switch
            {
                AlertRuleType.VeryClose => "NearEarth Alert: bardzo bliski obiekt NEO",
                AlertRuleType.LargeObject => "NearEarth Alert: duży obiekt NEO",
                AlertRuleType.PotentiallyHazardous => "NearEarth Alert: obiekt PHA",
                _ => "NearEarth Alert"
            };
        }

        return alert.RuleType switch
        {
            AlertRuleType.VeryClose => "NearEarth Alert: very close NEO",
            AlertRuleType.LargeObject => "NearEarth Alert: large NEO detected",
            AlertRuleType.PotentiallyHazardous => "NearEarth Alert: PHA object detected",
            _ => "NearEarth Alert"
        };
    }

    private string BuildTextBody(NeoAlert alert, string language)
    {
        var reason = language == "pl" ? alert.ReasonPl : alert.ReasonEn;

        if (language == "pl")
        {
            return $"""
            Alert NearEarth

            Obiekt: {alert.ObjectName}
            ID: {alert.ObjectId}
            Data przelotu: {alert.CloseApproachDate}
            Odległość: {alert.MissDistanceLunar:F2} LD
            Średnica: ~{Math.Round(alert.DiameterAverageMeters)} m
            Prędkość: {alert.VelocityKilometersPerSecond:F1} km/s
            PHA: {(alert.IsPotentiallyHazardous ? "TAK" : "NIE")}

            Powód: {reason}
            """;
        }

        return $"""
        NearEarth Alert

        Object: {alert.ObjectName}
        ID: {alert.ObjectId}
        Close approach date: {alert.CloseApproachDate}
        Distance: {alert.MissDistanceLunar:F2} LD
        Diameter: ~{Math.Round(alert.DiameterAverageMeters)} m
        Velocity: {alert.VelocityKilometersPerSecond:F1} km/s
        PHA: {(alert.IsPotentiallyHazardous ? "YES" : "NO")}

        Reason: {reason}
        """;
    }

    private string BuildHtmlBody(NeoAlert alert, string language)
    {
        var reason = language == "pl" ? alert.ReasonPl : alert.ReasonEn;
        var title = language == "pl" ? "Alert NearEarth" : "NearEarth Alert";
        var objectLabel = language == "pl" ? "Obiekt" : "Object";
        var dateLabel = language == "pl" ? "Data przelotu" : "Close approach date";
        var distanceLabel = language == "pl" ? "Odległość" : "Distance";
        var diameterLabel = language == "pl" ? "Średnica" : "Diameter";
        var velocityLabel = language == "pl" ? "Prędkość" : "Velocity";
        var reasonLabel = language == "pl" ? "Powód" : "Reason";

        return $"""
        <div style="font-family:Arial,sans-serif;background:#020617;color:#e5e7eb;padding:24px;border-radius:16px">
            <h2 style="margin:0 0 16px;color:#38bdf8">{title}</h2>
            <p style="margin:0 0 16px;color:#cbd5e1">{reason}</p>

            <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:6px;color:#94a3b8">{objectLabel}</td><td style="padding:6px">{alert.ObjectName}</td></tr>
                <tr><td style="padding:6px;color:#94a3b8">ID</td><td style="padding:6px">{alert.ObjectId}</td></tr>
                <tr><td style="padding:6px;color:#94a3b8">{dateLabel}</td><td style="padding:6px">{alert.CloseApproachDate}</td></tr>
                <tr><td style="padding:6px;color:#94a3b8">{distanceLabel}</td><td style="padding:6px">{alert.MissDistanceLunar:F2} LD</td></tr>
                <tr><td style="padding:6px;color:#94a3b8">{diameterLabel}</td><td style="padding:6px">~{Math.Round(alert.DiameterAverageMeters)} m</td></tr>
                <tr><td style="padding:6px;color:#94a3b8">{velocityLabel}</td><td style="padding:6px">{alert.VelocityKilometersPerSecond:F1} km/s</td></tr>
                <tr><td style="padding:6px;color:#94a3b8">PHA</td><td style="padding:6px">{(alert.IsPotentiallyHazardous ? "YES" : "NO")}</td></tr>
            </table>

            <p style="margin-top:18px;color:#94a3b8;font-size:13px">{reasonLabel}: {reason}</p>
        </div>
        """;
    }
}