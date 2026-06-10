using NearEarth.Api.Models.Alerts;
using NearEarth.Api.Models.Dashboard;

namespace NearEarth.Api.Services;

public class AlertEvaluationService
{
    public List<NeoAlert> Evaluate(DashboardResponse dashboard, EmailAlertSettings settings)
    {
        var alerts = new List<NeoAlert>();

        foreach (var item in dashboard.Objects)
        {
            if (settings.EnableVeryClose && item.MissDistanceLunar <= settings.VeryCloseMaxLd)
            {
                alerts.Add(new NeoAlert
                {
                    AlertId = BuildAlertId(item.Id, item.CloseApproachDate, AlertRuleType.VeryClose),
                    RuleType = AlertRuleType.VeryClose,
                    ObjectId = item.Id,
                    ObjectName = item.Name,
                    CloseApproachDate = item.CloseApproachDate,
                    MissDistanceLunar = item.MissDistanceLunar,
                    DiameterAverageMeters = item.DiameterAverageMeters,
                    VelocityKilometersPerSecond = item.VelocityKilometersPerSecond,
                    IsPotentiallyHazardous = item.IsPotentiallyHazardous,
                    ReasonEn = $"Object passed within {settings.VeryCloseMaxLd} LD from Earth.",
                    ReasonPl = $"Obiekt przeleciał w odległości do {settings.VeryCloseMaxLd} LD od Ziemi.",
                    Severity = "High"
                });
            }

            if (settings.EnableLargeObject && item.DiameterAverageMeters >= settings.LargeMinDiameterMeters)
            {
                alerts.Add(new NeoAlert
                {
                    AlertId = BuildAlertId(item.Id, item.CloseApproachDate, AlertRuleType.LargeObject),
                    RuleType = AlertRuleType.LargeObject,
                    ObjectId = item.Id,
                    ObjectName = item.Name,
                    CloseApproachDate = item.CloseApproachDate,
                    MissDistanceLunar = item.MissDistanceLunar,
                    DiameterAverageMeters = item.DiameterAverageMeters,
                    VelocityKilometersPerSecond = item.VelocityKilometersPerSecond,
                    IsPotentiallyHazardous = item.IsPotentiallyHazardous,
                    ReasonEn = $"Estimated object diameter is at least {settings.LargeMinDiameterMeters} meters.",
                    ReasonPl = $"Szacowana średnica obiektu wynosi co najmniej {settings.LargeMinDiameterMeters} metrów.",
                    Severity = "Medium"
                });
            }

            if (settings.EnablePotentiallyHazardous && item.IsPotentiallyHazardous)
            {
                alerts.Add(new NeoAlert
                {
                    AlertId = BuildAlertId(item.Id, item.CloseApproachDate, AlertRuleType.PotentiallyHazardous),
                    RuleType = AlertRuleType.PotentiallyHazardous,
                    ObjectId = item.Id,
                    ObjectName = item.Name,
                    CloseApproachDate = item.CloseApproachDate,
                    MissDistanceLunar = item.MissDistanceLunar,
                    DiameterAverageMeters = item.DiameterAverageMeters,
                    VelocityKilometersPerSecond = item.VelocityKilometersPerSecond,
                    IsPotentiallyHazardous = item.IsPotentiallyHazardous,
                    ReasonEn = "NASA marked this object as potentially hazardous.",
                    ReasonPl = "NASA oznaczyła ten obiekt jako potencjalnie niebezpieczny.",
                    Severity = "High"
                });
            }
        }

        return alerts
            .OrderBy(x => x.MissDistanceLunar)
            .ThenByDescending(x => x.Severity)
            .ToList();
    }

    private string BuildAlertId(string objectId, string date, AlertRuleType ruleType)
    {
        return $"{objectId}_{date}_{ruleType}";
    }
}