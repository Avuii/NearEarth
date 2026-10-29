namespace NearEarth.Api.Services;

public class AutomaticAlertWorker(
    IServiceScopeFactory scopeFactory,
    AlertSubscriptionStore subscriptions,
    IConfiguration configuration,
    ILogger<AutomaticAlertWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var interval = TimeSpan.FromMinutes(Math.Clamp(configuration.GetValue("Email:CheckIntervalMinutes", 15), 1, 1440));
        while (!stoppingToken.IsCancellationRequested)
        {
            var delay = TimeSpan.FromMinutes(1);
            try
            {
                using var scope = scopeFactory.CreateScope();
                await scope.ServiceProvider.GetRequiredService<AutomaticAlertProcessor>().CheckDueAsync(interval, stoppingToken);
                delay = subscriptions.GetNextDelay(DateTime.UtcNow, interval);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception)
            {
                logger.LogError("Automatic email alerts could not be processed. Retrying in one minute.");
            }

            try
            {
                await subscriptions.WaitForChangeAsync(delay, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }
    }
}
