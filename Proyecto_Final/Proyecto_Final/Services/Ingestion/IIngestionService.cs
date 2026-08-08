using Proyecto_Final.Domain.Entities;
using Proyecto_Final.DTOs.NewsItems;

namespace Proyecto_Final.Services.Ingestion;

public interface IIngestionService
{
    Task<IReadOnlyList<ParsedNewsItem>> FetchAndParseAsync(Source source);
}
