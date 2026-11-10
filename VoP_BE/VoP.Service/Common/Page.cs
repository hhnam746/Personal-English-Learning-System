namespace VoP.Service.Common;

public record Page<T>(IReadOnlyList<T> Items, int PageNumber, int PageSize, int TotalItems);
