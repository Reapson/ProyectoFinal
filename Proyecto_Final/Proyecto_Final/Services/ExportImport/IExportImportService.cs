using Proyecto_Final.Domain.Entities;
using Proyecto_Final.DTOs.SourceItems;

namespace Proyecto_Final.Services.ExportImport;

public interface IExportImportService
{
    ExportEnvelopeDto BuildEnvelope(SourceItem item);
    Task<SourceItem> ImportAsync(ExportEnvelopeDto envelope, string? userId);
}
