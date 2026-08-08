using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using Proyecto_Final.DTOs.NewsItems;
using Proyecto_Final.DTOs.Trending;
using Proyecto_Final.Repositories.Interfaces;
using Proyecto_Final.Services.Trending;

namespace Proyecto_Final.Controllers;

// Elemento Sorpresa: temas del momento / sentimiento agregado calculado
// sobre los SourceItems guardados en la base de datos.
[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class TrendingController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITagExtractionService _tagExtractionService;

    public TrendingController(IUnitOfWork unitOfWork, ITagExtractionService tagExtractionService)
    {
        _unitOfWork = unitOfWork;
        _tagExtractionService = tagExtractionService;
    }

    [HttpGet]
    public async Task<ActionResult<TrendingReportDto>> Get()
    {
        var savedItems = await _unitOfWork.SourceItems.GetAllAsync();
        var parsedItems = savedItems
            .Select(si => JsonSerializer.Deserialize<ParsedNewsItem>(si.Json))
            .Where(p => p is not null)
            .Select(p => p!);

        return Ok(_tagExtractionService.BuildTrendingReport(parsedItems));
    }
}
