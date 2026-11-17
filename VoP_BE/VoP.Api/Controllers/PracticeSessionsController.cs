using Microsoft.AspNetCore.Mvc;
using VoP.Service.Practice;

namespace VoP.Api.Controllers;
[ApiController, Route("api/practice-sessions")]

public sealed class PracticeSessionsController(IService service) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(SessionRequest request, CancellationToken ct)
    {
        var s = await service.Create(request, ct);
        return CreatedAtAction(nameof(Get), new { id = s.Id }, s);
    }
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default) => Ok(await service.List(page, pageSize, ct));
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct) => Ok(await service.Get(id, ct));
    [HttpGet("{id:guid}/next-question")]
    public async Task<IActionResult> Next(Guid id, CancellationToken ct)
    {
        var q = await service.Next(id, ct);
        return q == null ? NoContent() : Ok(q);
    }
    [HttpGet("{id:guid}/questions/{questionId:guid}/audio")]
    public async Task<IActionResult> Audio(Guid id, Guid questionId, CancellationToken ct)
    {
        var bytes = await service.QuestionAudio(id, questionId, ct);
        return bytes == null ? NotFound() : File(bytes, "audio/wav", enableRangeProcessing: true);
    }

    [HttpPost("{id:guid}/questions/{questionId:guid}/skip-audio")]
    public async Task<IActionResult> SkipAudio(Guid id, Guid questionId, CancellationToken ct)
    {
        await service.SkipAudio(id, questionId, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/answers")]
    public async Task<IActionResult> Answer(Guid id, AnswerRequest request, CancellationToken ct) => Ok(await service.Answer(id, request, ct));
    [HttpPost("{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id, CancellationToken ct) => Ok(await service.Finish(id, false, ct));
    [HttpPost("{id:guid}/abandon")]
    public async Task<IActionResult> Abandon(Guid id, CancellationToken ct) => Ok(await service.Finish(id, true, ct));
    [HttpGet("{id:guid}/attempts")]
    public async Task<IActionResult> Attempts(Guid id,
         [FromQuery] int page = 1,
         [FromQuery] int pageSize = 20,
         CancellationToken ct = default) => Ok(await service.Attempts(id, page, pageSize, ct));
}
