# VOP Backend — EF Core Code First

.NET 8, EF Core 8, Npgsql/PostgreSQL; structure follows the AutoWashPro sample (`Api`, `Repository/Entities`, `Enums`, `DbContext`, `Migrations`). Database schema is authored in C# and evolved using migrations, not by running the legacy SQL initializer.

The supplied DBML contains **9 domain tables**, 6 PostgreSQL enums, 11 foreign keys and 4 level check constraints. PostgreSQL also contains `__EFMigrationsHistory` (10 physical tables total). Updated timestamps have only the DBML `now()` insert default; no unrequested automatic update trigger.

## Local connection

PostgreSQL runs on `localhost:5433` in the existing `vop-local-postgres-1` Docker container. Database **vop_codefirst** is dedicated to EF migrations. The older `vop` SQL-initialized database and its data remain untouched.

`VoP.Api/appsettings.json` holds `ConnectionStrings:DefaultConnection` with host, port, database and user. The full local connection, including password, is stored in .NET user secrets (`vop-local-development`), not in tracked JSON. Use Development environment to load user secrets. On another machine set the same key with `dotnet user-secrets set` or the environment variable `ConnectionStrings__DefaultConnection`.

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
