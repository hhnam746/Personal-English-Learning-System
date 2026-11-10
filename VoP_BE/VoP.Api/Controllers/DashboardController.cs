using Microsoft.AspNetCore.Mvc;
using VoP.Service.Dashboard;

namespace VoP.Api.Controllers;
[ApiController, Route("api/dashboard")]

public sealed class DashboardController(IService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int days = 30, CancellationToken ct = default) => Ok(await service.Get(days, ct));
}
