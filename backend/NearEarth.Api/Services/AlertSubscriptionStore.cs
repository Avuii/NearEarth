using NearEarth.Api.Models.Alerts;

namespace NearEarth.Api.Services;

public class AlertSubscription
{
    public Guid Id { get; set; }
    public EmailAlertSettings Settings { get; set; } = new();
    public bool Enabled { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
    public DateTime? LastCheckedAtUtc { get; set; }
    public DateTime? LastSentAtUtc { get; set; }
    public string? LastError { get; set; }
}

public class AlertSubscriptionStore
{
    private readonly object _lock = new();
    private readonly SemaphoreSlim _changed = new(0, 1);
    private readonly string _path;
    private readonly List<AlertSubscription> _subscriptions;

    public AlertSubscriptionStore(IHostEnvironment environment)
        : this(Path.Combine(environment.ContentRootPath, "App_Data", "email-alert-subscriptions.json")) { }

    public AlertSubscriptionStore(string path)
    {
        _path = path;
        _subscriptions = AlertStorage.Read(path, new List<AlertSubscription>());
    }

    public AlertSubscription? Get(Guid id)
    {
        lock (_lock)
        {
            var subscription = _subscriptions.Find(item => item.Id == id);
            return subscription == null ? null : AlertStorage.Copy(subscription);
        }
    }

    public AlertSubscription? Save(Guid? id, EmailAlertSettings settings)
    {
        lock (_lock)
        {
            var next = AlertStorage.Copy(_subscriptions);
            var subscription = id.HasValue ? next.Find(item => item.Id == id.Value) : null;
            if (id.HasValue && subscription == null) return null;
            if (subscription == null)
            {
                subscription = new AlertSubscription { Id = Guid.NewGuid() };
                next.Add(subscription);
            }

            if (!string.Equals(subscription.Settings.Email, settings.Email, StringComparison.OrdinalIgnoreCase))
            {
                subscription.LastSentAtUtc = null;
            }
            subscription.Settings = AlertStorage.Copy(settings);
            subscription.Settings.StartDate = null;
            subscription.Enabled = true;
            subscription.UpdatedAtUtc = DateTime.UtcNow;
            subscription.LastCheckedAtUtc = null;
            subscription.LastError = null;
            Commit(next);
            SignalChange();
            return AlertStorage.Copy(subscription);
        }
    }

    public bool Disable(Guid id)
    {
        lock (_lock)
        {
            var next = AlertStorage.Copy(_subscriptions);
            var subscription = next.Find(item => item.Id == id);
            if (subscription == null) return false;
            subscription.Enabled = false;
            subscription.UpdatedAtUtc = DateTime.UtcNow;
            Commit(next);
            SignalChange();
            return true;
        }
    }

    public List<AlertSubscription> GetDue(DateTime nowUtc, TimeSpan interval)
    {
        lock (_lock)
        {
            return AlertStorage.Copy(_subscriptions.Where(item => item.Enabled &&
                (!item.LastCheckedAtUtc.HasValue || item.LastCheckedAtUtc.Value + interval <= nowUtc)).ToList());
        }
    }

    public void CompleteCheck(AlertSubscription checkedSubscription, bool sent, string? error)
    {
        lock (_lock)
        {
            var next = AlertStorage.Copy(_subscriptions);
            var subscription = next.Find(item => item.Id == checkedSubscription.Id);
            if (subscription == null || subscription.UpdatedAtUtc != checkedSubscription.UpdatedAtUtc) return;
            subscription.LastCheckedAtUtc = DateTime.UtcNow;
            if (sent) subscription.LastSentAtUtc = subscription.LastCheckedAtUtc;
            subscription.LastError = error;
            Commit(next);
        }
    }

    public TimeSpan GetNextDelay(DateTime nowUtc, TimeSpan interval)
    {
        lock (_lock)
        {
            var active = _subscriptions.Where(item => item.Enabled).ToList();
            if (active.Count == 0) return Timeout.InfiniteTimeSpan;
            var next = active.Min(item => item.LastCheckedAtUtc.HasValue ? item.LastCheckedAtUtc.Value + interval : nowUtc);
            return next > nowUtc ? next - nowUtc : TimeSpan.Zero;
        }
    }

    public Task<bool> WaitForChangeAsync(TimeSpan delay, CancellationToken cancellationToken) => _changed.WaitAsync(delay, cancellationToken);

    private void SignalChange()
    {
        if (_changed.CurrentCount == 0) _changed.Release();
    }

    private void Commit(List<AlertSubscription> next)
    {
        AlertStorage.Write(_path, next);
        _subscriptions.Clear();
        _subscriptions.AddRange(next);
    }
}
