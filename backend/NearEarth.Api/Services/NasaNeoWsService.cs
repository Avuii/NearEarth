using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using NearEarth.Api.Options;

namespace NearEarth.Api.Services;

public class NasaNeoWsService
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private readonly NasaOptions _options;

    public NasaNeoWsService(HttpClient httpClient, IMemoryCache cache, IOptions<NasaOptions> options)
    {
        _httpClient = httpClient;
        _cache = cache;
        _options = options.Value;
    }

    public async Task<string> GetFeedAsync(string startDate, string endDate)
    {
        var cacheKey = $"feed:{startDate}:{endDate}";

        if (_cache.TryGetValue(cacheKey, out string? cachedData) && cachedData != null)
        {
            return cachedData;
        }

        var url = $"{_options.BaseUrl}/feed?start_date={startDate}&end_date={endDate}&api_key={_options.ApiKey}";
        var data = await GetFromNasaAsync(url);

        _cache.Set(cacheKey, data, TimeSpan.FromMinutes(30));

        return data;
    }

    public async Task<string> GetAsteroidAsync(string id)
    {
        var cacheKey = $"asteroid:{id}";

        if (_cache.TryGetValue(cacheKey, out string? cachedData) && cachedData != null)
        {
            return cachedData;
        }

        var url = $"{_options.BaseUrl}/neo/{id}?api_key={_options.ApiKey}";
        var data = await GetFromNasaAsync(url);

        _cache.Set(cacheKey, data, TimeSpan.FromHours(6));

        return data;
    }

    public async Task<string> BrowseAsteroidsAsync(int page, int size)
    {
        var cacheKey = $"browse:{page}:{size}";

        if (_cache.TryGetValue(cacheKey, out string? cachedData) && cachedData != null)
        {
            return cachedData;
        }

        var url = $"{_options.BaseUrl}/neo/browse?page={page}&size={size}&api_key={_options.ApiKey}";
        var data = await GetFromNasaAsync(url);

        _cache.Set(cacheKey, data, TimeSpan.FromHours(1));

        return data;
    }

    private async Task<string> GetFromNasaAsync(string url)
    {
        var response = await _httpClient.GetAsync(url);

        if (!response.IsSuccessStatusCode)
        {
            var message = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException(message, null, response.StatusCode);
        }

        return await response.Content.ReadAsStringAsync();
    }
}