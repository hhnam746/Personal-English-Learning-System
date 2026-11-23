using Microsoft.AspNetCore.Mvc;
using VoP.Service.Vocabularies;

namespace VoP.Api.Controllers;
[ApiController, Route("api/vocabularies")]

public sealed class VocabulariesController(IService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? search,
         [FromQuery] int page = 1,
         [FromQuery] int pageSize = 20,
         [FromQuery] int? level = null,
         [FromQuery] bool dueOnly = false,
         [FromQuery] string sort = "recent",
         [FromQuery] string? exactTerm = null,
         [FromQuery] string? language = null,
         CancellationToken ct = default) => Ok(await service.List(search, page, pageSize, ct, level, dueOnly, sort, exactTerm, language));
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct) => Ok(await service.Get(id, ct));
    [HttpPost]
    public async Task<IActionResult> Create(VocabularyRequest request, CancellationToken ct)
    {
        var v = await service.Save(null, request, ct);
        return CreatedAtAction(nameof(Get), new { id = v.Id }, v);
    }
    [HttpPost("dictionary-meanings")]
    public async Task<IActionResult> Append(VocabularyRequest request, CancellationToken ct) =>
        Ok(await service.Save(null, request, ct, append: true));
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, VocabularyRequest request, CancellationToken ct) => Ok(await service.Save(id, request, ct));
    [HttpPatch("{id:guid}/meanings/{meaningId:guid}/dictionary-source")]
    public async Task<IActionResult> LinkSource(Guid id, Guid meaningId, DictionarySourceRequest request, CancellationToken ct) =>
        Ok(await service.LinkSource(id, meaningId, request, ct));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await service.Delete(id, ct);
        return NoContent();
    }
    [HttpPatch("{id:guid}/pronunciation")]
    public async Task<IActionResult> Pronunciation(Guid id, PronunciationRequest request, CancellationToken ct) => Ok(await service.Pronunciation(id, request, ct));
}
