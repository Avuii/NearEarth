using NearEarth.Api.Models.Alerts;

namespace NearEarth.Api.Services;

public class NotificationHistoryService
{
    private readonly object _lock = new();
    private readonly HashSet<string> _sentKeys = new();
    private readonly List<NeoAlert> _history = new();
    private readonly string? _path;
    public SemaphoreSlim DeliveryLock { get; } = new(1, 1);

    public NotificationHistoryService() { }

    public NotificationHistoryService(IHostEnvironment environment)
        : this(Path.Combine(environment.ContentRootPath, "App_Data", "email-alert-history.json")) { }

    public NotificationHistoryService(string path)
    {
        _path = path;
        var state = AlertStorage.Read(path, new NotificationHistoryState());
        _sentKeys.UnionWith(state.SentKeys);
        _history.AddRange(state.History);
    }

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
            if (_path != null)
            {
                AlertStorage.Write(_path, new NotificationHistoryState { SentKeys = _sentKeys.ToList(), History = _history });
            }
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

public class NotificationHistoryState
{
    public List<string> SentKeys { get; set; } = new();
    public List<NeoAlert> History { get; set; } = new();
}
