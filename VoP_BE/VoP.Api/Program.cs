using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Npgsql;
using VoP.Repository;
using VoP.Service.Common;

#if DEBUG
// Rider's .NET Project runner may bypass launchSettings.json entirely.
var hostConfiguration = new ConfigurationBuilder()
    .AddEnvironmentVariables("ASPNETCORE_")
    .AddEnvironmentVariables("DOTNET_")
    .AddCommandLine(args)
    .Build();
var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    EnvironmentName = hostConfiguration[HostDefaults.EnvironmentKey] ?? Environments.Development
});
#else
var builder = WebApplication.CreateBuilder(args);
#endif
// shortcut: one local learner, no account model; add authentication and per-user ownership before remote hosting.
builder.WebHost.UseUrls(builder.Configuration["urls"] ?? "http://127.0.0.1:5080");
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Configure ConnectionStrings:DefaultConnection.");
builder.Services.AddSingleton(_ => DatabaseConfiguration.CreateDataSource(connectionString));
builder.Services.AddDbContext<AppDbContext>((services, options) => options.UseNpgsql(services.GetRequiredService<NpgsqlDataSource>()));
builder.Services.AddScoped<VoP.Service.Vocabularies.IService, VoP.Service.Vocabularies.Service>();
builder.Services.AddScoped<VoP.Service.Practice.IService, VoP.Service.Practice.Service>();
builder.Services.AddScoped<VoP.Service.Learning.IService, VoP.Service.Learning.Service>();
builder.Services.AddScoped<VoP.Service.Flashcards.IService, VoP.Service.Flashcards.Service>();
builder.Services.AddScoped<VoP.Service.Dashboard.IService, VoP.Service.Dashboard.Service>();
builder.Services.AddScoped<VoP.Service.Dictionary.IService, VoP.Service.Dictionary.Service>();
builder.Services.AddSingleton(new OfflineAudio(builder.Configuration.GetValue("OfflinePronunciation:Enabled", OperatingSystem.IsMacOS())));
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, VoP.Api.Services.CurrentUserService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("VercelCors", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
            origin.Contains("localhost") ||
            origin.Contains("127.0.0.1") ||
            origin.EndsWith(".vercel.app") ||
            origin.Equals("https://vercel.app", StringComparison.OrdinalIgnoreCase))
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
var supabaseUrl = builder.Configuration["Supabase:Url"];
if (!string.IsNullOrEmpty(supabaseUrl))
{
    builder.Services.AddAuthentication(Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.Authority = $"{supabaseUrl.TrimEnd('/')}/auth/v1";
            options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = $"{supabaseUrl.TrimEnd('/')}/auth/v1",
                ValidateAudience = true,
                ValidAudience = "authenticated",
                ValidateLifetime = true
            };
        });
    builder.Services.AddAuthorization();
}
builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.SnakeCaseLower, false));
    o.JsonSerializerOptions.UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow;
});
builder.Services.AddProblemDetails();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "VOP API", Version = "v1" });
});
await using var app = builder.Build();
if (builder.Configuration["import-dictionary"] is { } dictionaryFile)
{
    await VoP.Service.Dictionary.Import.Run(app.Services.GetRequiredService<NpgsqlDataSource>(), dictionaryFile);
    return;
}
app.Use(async (HttpContext context, RequestDelegate next) =>
{
    try
    {
        await next(context);
    }
    catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
    {
        context.Abort();
    }
    catch (Exception ex)
    {
        var (status, message) = ex switch
        {
            ApiException error => (error.Status, error.Message),
            DbUpdateException
            {
                InnerException: PostgresException { SqlState: PostgresErrorCodes.UniqueViolation }
            } => (409, "Resource already exists or request was already applied."),
            _ => (500, "An unexpected error occurred.")
        };
        if (status == 500) app.Logger.LogError(ex, "Request failed {TraceId}", context.TraceIdentifier);
        await Results.Problem(
            statusCode: status,
            title: message,
            extensions: new Dictionary<string, object?>
            {
                { "traceId", context.TraceIdentifier }
            }).ExecuteAsync(context);
    }
});
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();
}
app.UseStaticFiles();
app.UseCors("VercelCors");
if (!string.IsNullOrEmpty(supabaseUrl))
{
    app.UseAuthentication();
    app.UseAuthorization();
}
app.MapControllers();
app.MapGet("/health", async (AppDbContext db, CancellationToken ct) =>
    await db.Database.CanConnectAsync(ct)
        ? Results.Ok(new { status = "healthy" })
        : Results.StatusCode(503));
await app.RunAsync();
public partial class Program;
