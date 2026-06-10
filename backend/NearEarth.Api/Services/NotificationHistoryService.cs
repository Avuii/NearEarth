using NearEarth.Api.Models.Alerts;

namespace NearEarth.Api.Services;

public class NotificationHistoryService
{
    private readonly object _lock = new();
    private readonly HashSet<string> _sentKeys = new();
    private readonly List<NeoAlert> _history = new();

    public bool WasSent(string key)
    {
        lock (_lock)
        {
            return _sentKeys.Contains(key);
        }
    }

    public void MarkAsSent(string key, NeoAlert alert)
    {
        lock (_lock)
        {
            _sentKeys.Add(key);
            _history.Add(alert);
        }
    }

    public List<NeoAlert> GetHistory()
    {
        lock (_lock)
        {
            return _history
                .OrderByDescending(x => x.CreatedAtUtc)
                .ToList();
        }
    }
}