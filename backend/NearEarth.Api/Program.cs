using NearEarth.Api.Options;
using NearEarth.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<NasaOptions>(builder.Configuration.GetSection("Nasa"));

builder.Services.AddMemoryCache();

builder.Services.AddHttpClient<NasaNeoWsService>();
builder.Services.AddHttpClient<EmailNotificationSender>();

builder.Services.AddScoped<DashboardService>();
builder.Services.AddScoped<AlertEvaluationService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddSingleton<NotificationHistoryService>();

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.MapControllers();

app.Run();