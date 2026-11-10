using Microsoft.AspNetCore.Mvc;
using VoP.Service.Learning;

namespace VoP.Api.Controllers;
[ApiController, Route("api/learning-progress")]

public sealed class LearningProgressController(IService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int? level,
         [FromQuery] bool dueOnly = false,
         [FromQuery] bool? suspended = null,
         [FromQuery] int page = 1,
         [FromQuery] int pageSize = 20,
         CancellationToken ct = default) => Ok(await service.List(level, dueOnly, suspended, page, pageSize, ct));
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct) => Ok(await service.Get(id, ct));
    [HttpPatch("{id:guid}/suspension")]
    public async Task<IActionResult> Suspend(Guid id, SuspensionRequest request, CancellationToken ct) => Ok(await service.Suspend(id, request.IsSuspended, ct));
    [HttpGet("{id:guid}/evaluations")]
    public async Task<IActionResult> History(Guid id,
         [FromQuery] int page = 1,
         [FromQuery] int pageSize = 20,
         CancellationToken ct = default) => Ok(await service.History(id, page, pageSize, ct));
}
