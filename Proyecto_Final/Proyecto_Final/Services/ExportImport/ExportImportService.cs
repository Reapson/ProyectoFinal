using System.Text.Json;
using Proyecto_Final.Domain.Entities;
using Proyecto_Final.DTOs.NewsItems;
using Proyecto_Final.DTOs.SourceItems;
using Proyecto_Final.Repositories.Interfaces;

namespace Proyecto_Final.Services.ExportImport;

// Builds/consumes the cross-group interoperable JSON envelope (ExportEnvelopeDto).
// On import, the referenced Source is matched by Url or created on the fly so
// the uploaded item becomes a first-class part of this app's Sources/SourceItems.
public class ExportImportService : IExportImportService
{
    private readonly IUnitOfWork _unitOfWork;

    public ExportImportService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public ExportEnvelopeDto BuildEnvelope(SourceItem item)
    {
        var parsedItem = JsonSerializer.Deserialize<ParsedNewsItem>(item.Json) ?? new ParsedNewsItem();

        return new ExportEnvelopeDto
        {
            ExportedAt = DateTime.UtcNow,
            Source = new ExportedSourceDto
            {
                Url = item.Source?.Url ?? string.Empty,
                Name = item.Source?.Name ?? "Desconocida",
                Description = item.Source?.Description,
                ComponentType = item.Source?.ComponentType ?? "json"
            },
            Item = parsedItem
        };
    }

    public async Task<SourceItem> ImportAsync(ExportEnvelopeDto envelope, string? userId)
    {
        var source = await _unitOfWork.Sources.GetByUrlAsync(envelope.Source.Url);
        if (source is null && !string.IsNullOrWhiteSpace(envelope.Source.Url))
        {
            source = new Source
            {
                Url = envelope.Source.Url,
                Name = envelope.Source.Name,
                Description = envelope.Source.Description,
                ComponentType = string.IsNullOrWhiteSpace(envelope.Source.ComponentType) ? "json" : envelope.Source.ComponentType,
                RequiresSecret = false
            };
            await _unitOfWork.Sources.AddAsync(source);
            await _unitOfWork.SaveChangesAsync();
        }

        var sourceItem = new SourceItem
        {
            SourceId = source?.Id,
            Json = JsonSerializer.Serialize(envelope.Item),
            CreatedAt = DateTime.UtcNow,
            SavedByUserId = userId
        };

        await _unitOfWork.SourceItems.AddAsync(sourceItem);
        await _unitOfWork.SaveChangesAsync();

        return sourceItem;
    }
}
