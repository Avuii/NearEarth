using System.Globalization;
using System.Text.Json;
using NearEarth.Api.Models.Dashboard;
using NearEarth.Api.Models.Nasa;

namespace NearEarth.Api.Services;

public class DashboardService
{
    private readonly NasaNeoWsService _nasaNeoWsService;

    public DashboardService(NasaNeoWsService nasaNeoWsService)
    {
        _nasaNeoWsService = nasaNeoWsService;
    }

    public async Task<DashboardResponse> GetDashboardAsync(string startDate, string endDate)
    {
        var rawJson = await _nasaNeoWsService.GetFeedAsync(startDate, endDate);

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        var nasaData = JsonSerializer.Deserialize<NasaFeedResponse>(rawJson, options);

        if (nasaData == null)
        {
            throw new Exception("NASA data could not be parsed");
        }

        var objects = new List<DashboardNeoItem>();

        foreach (var dateGroup in nasaData.NearEarthObjects)
        {
            foreach (var neo in dateGroup.Value)
            {
                foreach (var approach in neo.CloseApproachData)
                {
                    var item = CreateDashboardItem(neo, approach);
                    objects.Add(item);
                }
            }
        }

        return BuildDashboardResponse(startDate, endDate, objects);
    }

    public async Task<DashboardResponse> GetDashboardRangeAsync(string startDate, int days)
    {
        var start = DateTime.Parse(startDate, CultureInfo.InvariantCulture);
        var end = start.AddDays(days - 1);

        var allObjects = new List<DashboardNeoItem>();

        var currentStart = start;

        while (currentStart <= end)
        {
            var currentEnd = currentStart.AddDays(7);

            if (currentEnd > end)
            {
                currentEnd = end;
            }

            var chunkStart = currentStart.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
            var chunkEnd = currentEnd.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

            var chunk = await GetDashboardAsync(chunkStart, chunkEnd);

            allObjects.AddRange(chunk.Objects);

            currentStart = currentEnd.AddDays(1);
        }

        return BuildDashboardResponse(
            start.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            end.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            allObjects
        );
    }

    private DashboardResponse BuildDashboardResponse(string startDate, string endDate, List<DashboardNeoItem> objects)
    {
        objects = objects
            .OrderBy(x => x.CloseApproachDate)
            .ThenBy(x => x.MissDistanceKilometers)
            .ToList();

        var dailyApproaches = objects
            .GroupBy(x => x.CloseApproachDate)
            .OrderBy(x => x.Key)
            .Select(group => new DailyApproachCount
            {
                Date = group.Key,
                Count = group.Count(),
                HazardousCount = group.Count(x => x.IsPotentiallyHazardous)
            })
            .ToList();

        var totalObjects = objects.Count;
        var hazardousObjects = objects.Count(x => x.IsPotentiallyHazardous);
        var safeObjects = totalObjects - hazardousObjects;

        var averageDistance = objects.Count > 0
            ? Math.Round(objects.Average(x => x.MissDistanceLunar), 2)
            : 0;

        var averageVelocity = objects.Count > 0
            ? Math.Round(objects.Average(x => x.VelocityKilometersPerHour), 2)
            : 0;

        return new DashboardResponse
        {
            StartDate = startDate,
            EndDate = endDate,
            GeneratedAtUtc = DateTime.UtcNow,
            Summary = new DashboardSummaryCard
            {
                TotalObjects = totalObjects,
                HazardousObjects = hazardousObjects,
                SafeObjects = safeObjects,
                AverageDistanceLunar = averageDistance,
                AverageVelocityKilometersPerHour = averageVelocity
            },
            ClosestObject = objects.OrderBy(x => x.MissDistanceKilometers).FirstOrDefault(),
            FastestObject = objects.OrderByDescending(x => x.VelocityKilometersPerHour).FirstOrDefault(),
            LargestObject = objects.OrderByDescending(x => x.DiameterAverageMeters).FirstOrDefault(),
            DailyApproaches = dailyApproaches,
            Objects = objects
        };
    }

    private DashboardNeoItem CreateDashboardItem(NasaNeoObject neo, NasaCloseApproachData approach)
    {
        var diameterMin = neo.EstimatedDiameter.Meters.EstimatedDiameterMin;
        var diameterMax = neo.EstimatedDiameter.Meters.EstimatedDiameterMax;
        var diameterAverage = (diameterMin + diameterMax) / 2;

        var velocityKph = ParseDouble(approach.RelativeVelocity.KilometersPerHour);
        var velocityKps = ParseDouble(approach.RelativeVelocity.KilometersPerSecond);
        var distanceKm = ParseDouble(approach.MissDistance.Kilometers);
        var distanceLunar = ParseDouble(approach.MissDistance.Lunar);
        var distanceAstronomical = ParseDouble(approach.MissDistance.Astronomical);

        return new DashboardNeoItem
        {
            Id = neo.Id,
            Name = neo.Name,
            NasaJplUrl = neo.NasaJplUrl,
            CloseApproachDate = approach.CloseApproachDate,
            CloseApproachDateFull = approach.CloseApproachDateFull,
            AbsoluteMagnitudeH = neo.AbsoluteMagnitudeH,
            DiameterMinMeters = Math.Round(diameterMin, 2),
            DiameterMaxMeters = Math.Round(diameterMax, 2),
            DiameterAverageMeters = Math.Round(diameterAverage, 2),
            VelocityKilometersPerHour = Math.Round(velocityKph, 2),
            VelocityKilometersPerSecond = Math.Round(velocityKps, 2),
            MissDistanceKilometers = Math.Round(distanceKm, 2),
            MissDistanceLunar = Math.Round(distanceLunar, 2),
            MissDistanceAstronomical = Math.Round(distanceAstronomical, 6),
            IsPotentiallyHazardous = neo.IsPotentiallyHazardousAsteroid,
            OrbitingBody = approach.OrbitingBody
        };
    }

    private double ParseDouble(string value)
    {
        if (double.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture, out var result))
        {
            return result;
        }

        return 0;
    }
}