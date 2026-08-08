using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Proyecto_Final.Domain.Entities;
using Proyecto_Final.DTOs.NewsItems;
using Proyecto_Final.DTOs.SourceItems;
using Proyecto_Final.Repositories.Interfaces;
using Proyecto_Final.Services.ExportImport;
using Proyecto_Final.Services.Ingestion;

namespace Proyecto_Final.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SourceItemsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IIngestionService _ingestionService;
    private readonly IExportImportService _exportImportService;
    private readonly ILogger<SourceItemsController> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new() { WriteIndented = true };

    public SourceItemsController(
        IUnitOfWork unitOfWork,
        IIngestionService ingestionService,
        IExportImportService exportImportService,
        ILogger<SourceItemsController> logger)
    {
        _unitOfWork = unitOfWork;
        _ingestionService = ingestionService;
        _exportImportService = exportImportService;
        _logger = logger;
    }

    // Landing page principal: si hay items guardados los muestra; si la tabla
    // esta vacia, cae en vivo a las fuentes configuradas (PDF: "Si no tiene
    // items guardados, entonces debe mostrar items cargados de las fuentes").
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<object>>> GetAll()
    {
        var saved = await _unitOfWork.SourceItems.GetAllWithSourceAsync();
        if (saved.Count > 0)
        {
            return Ok(saved.Select(si => new SourceItemDto
            {
                Id = si.Id,
                SourceId = si.SourceId,
                SourceName = si.Source?.Name,
                Item = JsonSerializer.Deserialize<ParsedNewsItem>(si.Json) ?? new ParsedNewsItem(),
                CreatedAt = si.CreatedAt
            }));
        }

        var sources = await _unitOfWork.Sources.GetAllAsync();
        var liveItems = new List<LiveNewsItemDto>();
        foreach (var source in sources)
        {
            try
            {
                var parsed = await _ingestionService.FetchAndParseAsync(source);
                liveItems.AddRange(parsed.Select(p => new LiveNewsItemDto
                {
                    SourceId = source.Id,
                    SourceName = source.Name,
                    Item = p
                }));
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "No se pudo leer la fuente {SourceName} para el fallback en vivo", source.Name);
            }
        }

        return Ok(liveItems);
    }

    // Guardar un item elegido por el usuario. Solo usuarios autenticados
    // (cualquier rol) pueden ejecutar esta operacion, segun el PDF.
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<SourceItemDto>> Save(SaveItemDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var sourceItem = new SourceItem
        {
            SourceId = dto.SourceId,
            Json = JsonSerializer.Serialize(dto.Item),
            CreatedAt = DateTime.UtcNow,
            SavedByUserId = userId
        };

        await _unitOfWork.SourceItems.AddAsync(sourceItem);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new SourceItemDto
        {
            Id = sourceItem.Id,
            SourceId = sourceItem.SourceId,
            Item = dto.Item,
            CreatedAt = sourceItem.CreatedAt
        });
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _unitOfWork.SourceItems.GetByIdAsync(id);
        if (item is null) return NotFound();

        _unitOfWork.SourceItems.Remove(item);
        await _unitOfWork.SaveChangesAsync();
        return NoContent();
    }

    // Descarga el item guardado como JSON, en el formato interoperable
    // (ExportEnvelopeDto) que cualquier otro grupo puede volver a subir.
    [HttpGet("{id:int}/download")]
    [Authorize]
    public async Task<IActionResult> Download(int id)
    {
        var item = await _unitOfWork.SourceItems.GetByIdWithSourceAsync(id);
        if (item is null) return NotFound();

        var envelope = _exportImportService.BuildEnvelope(item);
        var json = JsonSerializer.Serialize(envelope, JsonOptions);
        var bytes = Encoding.UTF8.GetBytes(json);

        return File(bytes, "application/json", $"source-item-{item.Id}.json");
    }

    // Sube un JSON exportado (por esta app o cualquier otra del curso) y lo
    // integra a Sources/SourceItems de esta aplicacion.
    [HttpPost("upload")]
    [Authorize]
    public async Task<ActionResult<SourceItemDto>> Upload(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest("Debe adjuntar un archivo JSON.");

        using var reader = new StreamReader(file.OpenReadStream());
        var content = await reader.ReadToEndAsync();

        ExportEnvelopeDto? envelope;
        try
        {
            envelope = JsonSerializer.Deserialize<ExportEnvelopeDto>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch (JsonException ex)
        {
            return BadRequest($"JSON invalido: {ex.Message}");
        }

        if (envelope is null || string.IsNullOrWhiteSpace(envelope.Item.Title))
            return BadRequest("El JSON no tiene el formato esperado (Source + Item).");

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var saved = await _exportImportService.ImportAsync(envelope, userId);

        return Ok(new SourceItemDto
        {
            Id = saved.Id,
            SourceId = saved.SourceId,
            Item = envelope.Item,
            CreatedAt = saved.CreatedAt
        });
    }
}
