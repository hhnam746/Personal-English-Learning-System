# VOP Backend — EF Core Code First

.NET 8, EF Core 8, Npgsql/PostgreSQL; structure follows the AutoWashPro sample (`Api`, `Repository/Entities`, `Enums`, `DbContext`, `Migrations`). Database schema is authored in C# and evolved using migrations, not by running the legacy SQL initializer.

The supplied DBML contains **9 domain tables**, 6 PostgreSQL enums, 11 foreign keys and 4 level check constraints. PostgreSQL also contains `__EFMigrationsHistory` (10 physical tables total). Updated timestamps have only the DBML `now()` insert default; no unrequested automatic update trigger.

## Local connection

PostgreSQL runs on `localhost:5433` in the existing `vop-local-postgres-1` Docker container. Database **vop_codefirst** is dedicated to EF migrations. The older `vop` SQL-initialized database and its data remain untouched.

After cloning, create local settings from the sanitized template:

```sh
cp VoP.Api/appsettings.example.json VoP.Api/appsettings.json
```

`VoP.Api/appsettings.json` and environment-specific `appsettings*.json` are local, ignored files. Only `appsettings*.example.json` templates are versioned. `VoP.Api/appsettings.json` holds `ConnectionStrings:DefaultConnection` with host, port, database and user. The full local connection, including password, is stored in .NET user secrets (`vop-local-development`), not in tracked JSON. Use Development environment to load user secrets. On another machine set the same key with `dotnet user-secrets set` or the environment variable `ConnectionStrings__DefaultConnection`.

## Commands

Run in this directory:

```sh
dotnet tool restore
dotnet build
dotnet ef migrations add YourChange --project VoP.Repository --startup-project VoP.Api -- --environment Development
dotnet ef database update --project VoP.Repository --startup-project VoP.Api -- --environment Development
dotnet ef migrations has-pending-model-changes --project VoP.Repository --startup-project VoP.Api -- --environment Development
dotnet run --project VoP.DatabaseChecks
```

Start only the PostgreSQL service if stopped: from `../database`, `docker compose up -d`. Its legacy initializer targets `vop`, not the EF database. Do not run `database/init/001_schema.sql` against `vop_codefirst`.

`VoP.DatabaseChecks` exercises inserts across all entities and native enum/JSON reads in a rolled-back transaction. `VoP.DatabaseChecks/schema.sql` verifies catalog counts, uniqueness, FK/check constraints, RESTRICT and SET NULL deletion behavior in a rolled-back transaction; run with psql against `vop_codefirst`.

Business endpoints now cover vocabulary/pronunciation, practice, SRS, reinforcement, flashcards and dashboard. See [API.md](API.md) for routes, request examples, defaults and maintenance notes. Controllers live in `VoP.Api/Controllers`; business services/interfaces/DTOs in `VoP.Service/<Feature>`, querying Repository AppDbContext as in the AutoWashPro sample. Frontend wiring is not included. Migrations remain explicit.

Run the API: `dotnet run --project VoP.Api -- --environment Development` (loopback port5080). Run HTTP/database integration checks: `dotnet run --project VoP.ApiChecks`; this creates and retains its own isolated test database, never resets live data. Additive migration `AddSessionQuestionPlans` stores durable server-only question plans without changing existing learning records.

Enum mapping follows Npgsql's EF Core <9 setup: https://www.npgsql.org/efcore/mapping/enum.html

## Swagger UI (Development)

```sh
dotnet run --project VoP.Api -- --environment Development
```

Open http://127.0.0.1:5080/swagger to browse endpoints and use **Try it out**. The OpenAPI document is at http://127.0.0.1:5080/swagger/v1/swagger.json. Swagger is disabled outside Development. Requests execute against the configured database, so write operations change local data.

## Git and local secrets

- Keep database passwords in .NET user secrets or environment variables, never in tracked settings. `database/.env.example` is a blank template; the real `.env` stays local.
- Build output, IDE state, logs, private keys and local database exports are ignored at the repository root.
- `Properties/launchSettings.json` remains tracked: it contains only the shared Development launch profile and Swagger URL, not credentials. Do not add passwords or tokens to it.
- Ignore rules do not erase previous commits. If a real credential was pushed, revoke/rotate it; removing a tracked file in a new commit does not remove the old content from history.

### Rider / direct Debug Run

A Debug build defaults to Development when neither host environment variable nor `--environment` is supplied. This also applies to Rider's **.NET Project → VoP.Api** configuration, which may bypass launchSettings.json. Local user secrets are therefore loaded and Swagger is enabled without manual environment setup. Explicit `DOTNET_ENVIRONMENT`, `ASPNETCORE_ENVIRONMENT`, and command-line settings retain normal precedence. Release builds still default to Production with Swagger disabled.

Open http://127.0.0.1:5080/ or http://127.0.0.1:5080/swagger after Run; `/` redirects to Swagger only in Development. Stop an existing API instance before starting another on the same port. The `http` launch profile also opens Swagger when the IDE uses launch profiles.
