using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using VoP.Repository;

namespace VoP.Service.Common;

public static class LearningMutation
{
    public static async Task<IDbContextTransaction> Lock(AppDbContext db, CancellationToken ct, Guid? userId = null)
    {
        var tx = await db.Database.BeginTransactionAsync(ct);
        // Multi-user app: serialize learning mutations per user, avoiding global locking bottleneck.
        long lockKey = userId.HasValue ? Math.Abs((long)userId.Value.GetHashCode() * 397L) : 902391L;
        await db.Database.ExecuteSqlRawAsync($"SELECT pg_advisory_xact_lock({lockKey})", ct);
        return tx;
    }
}
