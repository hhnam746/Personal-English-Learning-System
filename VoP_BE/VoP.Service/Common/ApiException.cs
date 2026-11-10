namespace VoP.Service.Common;

public sealed class ApiException(int status, string message) : Exception(message)
{
    public int Status { get; } = status;
}
