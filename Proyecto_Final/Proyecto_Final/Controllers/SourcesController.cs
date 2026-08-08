using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Proyecto_Final.Domain.Entities;
using Proyecto_Final.DTOs.NewsItems;
using Proyecto_Final.DTOs.Sources;
using Proyecto_Final.Repositories.Interfaces;
using Proyecto_Final.Services.Ingestion;

namespace Proyecto_Final.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SourcesController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IIngestionService _ingestionService;
    private readonly ILogger<SourcesController> _logger;

    public SourcesController(IUnitOfWork unitOfWork, IIngestionService ingestionService, ILogger<SourcesController> logger)
    {
        _unitOfWork = unitOfWork;
        _ingestionService = ingestionService;
        _logger = logger;
    }

    // Publico: la landing page necesita listar las fuentes disponibles.
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<SourceDto>>> GetAll()
    {
        var sources = await _unitOfWork.Sources.GetAllAsync();
        return Ok(sources.Select(ToDto));
    }

    // Solo Admin puede agregar fuentes (seccion arriba de la pagina, PDF punto 2).
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SourceDto>> Create(CreateSourceDto dto)
    {
        var existing = await _unitOfWork.Sources.GetByUrlAsync(dto.Url);
        if (existing is not null)
            return Conflict("Ya existe una fuente con esa URL.");

        var source = new Source
        {
            Url = dto.Url,
            Name = dto.Name,
            Description = dto.Description,
            ComponentType = dto.ComponentType,
            RequiresSecret = dto.RequiresSecret,
            SecretKeyName = dto.SecretKeyName
        };

        await _unitOfWork.Sources.AddAsync(source);
        await _unitOfWork.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = source.Id }, ToDto(source));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var source = await _unitOfWork.Sources.GetByIdAsync(id);
        if (source is null) return NotFound();

        _unitOfWork.Sources.Remove(source);
        await _unitOfWork.SaveChangesAsync();
        return NoContent();
    }

    // Ingesta en vivo de una fuente puntual: lee, parsea (json/xml/html) y
    // devuelve items normalizados para que el usuario escoja cual guardar.
    [HttpGet("{id:int}/live")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<ParsedNewsItem>>> GetLiveItems(int id)
    {
        var source = await _unitOfWork.Sources.GetByIdAsync(id);
        if (source is null) return NotFound();

        try
        {
            var items = await _ingestionService.FetchAndParseAsync(source);
            return Ok(items);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Fallo la ingesta de la fuente {SourceId}", id);
            return StatusCode(StatusCodes.Status502BadGateway, $"No se pudo leer la fuente: {ex.Message}");
        }
    }

    private static SourceDto ToDto(Source s) => new()
    {
        Id = s.Id,
        Url = s.Url,
        Name = s.Name,
        Description = s.Description,
        ComponentType = s.ComponentType,
        RequiresSecret = s.RequiresSecret,
        CreatedAt = s.CreatedAt
    };
}
