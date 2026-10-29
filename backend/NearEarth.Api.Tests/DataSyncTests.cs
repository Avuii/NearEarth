using System.Net;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using NearEarth.Api.Options;
using NearEarth.Api.Services;
using Xunit;

namespace NearEarth.Api.Tests;

public class DataSyncTests
{
    [Fact]
    public async Task CachedDashboardKeepsOriginalSyncTimeAndManualSyncFetchesFreshData()
    {
        var handler = new StubHandler(_ => Task.FromResult(Feed()));
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var dashboard = Dashboard(handler, cache);

        var first = await dashboard.GetDashboardAsync("2026-10-29", "2026-11-05");
        var cached = await dashboard.GetDashboardAsync("2026-10-29", "2026-11-05");
        Assert.Equal(first.LastSyncedAtUtc, cached.LastSyncedAtUtc);
        Assert.Equal(DateTimeKind.Utc, cached.LastSyncedAtUtc.Kind);
        Assert.Equal(1, handler.Calls);

        var fresh = await dashboard.GetDashboardAsync("2026-10-29", "2026-11-05", forceRefresh: true);
        Assert.True(fresh.LastSyncedAtUtc >= cached.LastSyncedAtUtc);
        Assert.Equal(2, handler.Calls);
    }

    [Fact]
    public async Task FailedRefreshDoesNotReplaceSuccessfulCachedData()
    {
        var fail = false;
        var handler = new StubHandler(_ => Task.FromResult(fail ? new HttpResponseMessage(HttpStatusCode.ServiceUnavailable) : Feed()));
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var dashboard = Dashboard(handler, cache);
        var first = await dashboard.GetDashboardAsync("2026-10-29", "2026-11-05");

        fail = true;
        await Assert.ThrowsAsync<HttpRequestException>(() => dashboard.GetDashboardAsync("2026-10-29", "2026-11-05", forceRefresh: true));
        var cached = await dashboard.GetDashboardAsync("2026-10-29", "2026-11-05");
        Assert.Equal(first.LastSyncedAtUtc, cached.LastSyncedAtUtc);
        Assert.Equal(2, handler.Calls);
    }

    [Fact]
    public async Task RangeRefreshUpdatesEveryChunkAndCachedRangeRetainsSyncTime()
    {
        var handler = new StubHandler(_ => Task.FromResult(Feed()));
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var dashboard = Dashboard(handler, cache);

        var first = await dashboard.GetDashboardRangeAsync("2026-10-29", 30);
        Assert.Equal(4, handler.Calls);
        var cached = await dashboard.GetDashboardRangeAsync("2026-10-29", 30);
        Assert.Equal(first.LastSyncedAtUtc, cached.LastSyncedAtUtc);
        Assert.Equal(4, handler.Calls);
        var fresh = await dashboard.GetDashboardRangeAsync("2026-10-29", 30, forceRefresh: true);
        Assert.True(fresh.LastSyncedAtUtc >= first.LastSyncedAtUtc);
        Assert.Equal(8, handler.Calls);
    }

    private static HttpResponseMessage Feed() => new(HttpStatusCode.OK)
    {
        Content = new StringContent("{\"near_earth_objects\":{}}")
    };

    private static DashboardService Dashboard(StubHandler handler, IMemoryCache cache) => new(
        new NasaNeoWsService(new HttpClient(handler), cache,
            Microsoft.Extensions.Options.Options.Create(new NasaOptions { BaseUrl = "https://nasa.example", ApiKey = "test-key" })));
}
