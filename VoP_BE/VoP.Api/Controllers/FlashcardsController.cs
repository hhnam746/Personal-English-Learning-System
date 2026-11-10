using Microsoft.AspNetCore.Mvc;
using VoP.Service.Flashcards;

namespace VoP.Api.Controllers;
[ApiController, Route("api/flashcards")]

public sealed class FlashcardsController(IService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int? level,
         [FromQuery] int page = 1,
         [FromQuery] int pageSize = 20,
         CancellationToken ct = default) => Ok(await service.List(level, page, pageSize, ct));
    [HttpPost("{id:guid}/reviews")]
    public async Task<IActionResult> Rate(Guid id, RatingRequest request, CancellationToken ct) => StatusCode(201,
         await service.Rate(id, request, ct));
    [HttpGet("reviews")]
    public async Task<IActionResult> History([FromQuery] Guid? vocabularyId,
         [FromQuery] int page = 1,
         [FromQuery] int pageSize = 20,
         CancellationToken ct = default) => Ok(await service.History(vocabularyId, page, pageSize, ct));
}
