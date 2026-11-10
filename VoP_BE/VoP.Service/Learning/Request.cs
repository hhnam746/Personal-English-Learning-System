using System.Text.Json.Serialization;

namespace VoP.Service.Learning;

public record SuspensionRequest([property: JsonRequired] bool IsSuspended);
