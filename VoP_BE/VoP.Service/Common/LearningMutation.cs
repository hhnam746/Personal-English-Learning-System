using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using VoP.Repository;

namespace VoP.Service.Common;

public static class LearningMutation
{
    public static async Task<IDbContextTransaction> Lock(AppDbContext db, CancellationToken ct)
    {
        var tx = await db.Database.BeginTransactionAsync(ct);
        // Single-user app: serialize learning mutations across processes, not only HTTP requests.
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(902391)", ct);
        return tx;
    }
}
