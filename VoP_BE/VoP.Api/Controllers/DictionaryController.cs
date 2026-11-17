using Microsoft.AspNetCore.Mvc;
using VoP.Service.Dictionary;
using VoP.Service.Common;

namespace VoP.Api.Controllers;

[ApiController, Route("api/dictionary/entries")]
public sealed class DictionaryController(IService service, OfflineAudio audio) : ControllerBase
{
    [HttpGet]
    public Task<Suggestion[]> Search([FromQuery] string q, CancellationToken ct) => service.Search(q, ct);

    [HttpGet("/api/pronunciation")]
    public async Task<IActionResult> Pronunciation([FromQuery] string term, CancellationToken ct)
    {
        Rules.Require(!string.IsNullOrWhiteSpace(term) && term.Length <= 255, "Pronunciation requires a term of up to 255 characters.");
        var bytes = await audio.Speak(term, ct);
        return bytes == null ? NotFound() : File(bytes, "audio/wav", enableRangeProcessing: true);
    }

    [HttpGet("{id:long}")]
    public Task<Entry> Get(long id, CancellationToken ct) => service.Get(id, ct);
}
