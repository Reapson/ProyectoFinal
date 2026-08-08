using Proyecto_Final.Domain.Entities;
using Proyecto_Final.DTOs.NewsItems;
using Proyecto_Final.Services.Parsing;
using Proyecto_Final.Services.Secrets;

namespace Proyecto_Final.Services.Ingestion;

// Orchestrates: resolve secret (if any) -> HTTP GET the Source.Url -> hand the
// raw body to the right IContentParser strategy (via ContentParserFactory).
public class IngestionService : IIngestionService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IContentParserFactory _parserFactory;
    private readonly ISecretService _secretService;
    private readonly ILogger<IngestionService> _logger;

    public IngestionService(
        IHttpClientFactory httpClientFactory,
        IContentParserFactory parserFactory,
        ISecretService secretService,
        ILogger<IngestionService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _parserFactory = parserFactory;
        _secretService = secretService;
        _logger = logger;
    }

    public async Task<IReadOnlyList<ParsedNewsItem>> FetchAndParseAsync(Source source)
    {
        var url = source.Url;

        if (source.RequiresSecret)
        {
            if (string.IsNullOrWhiteSpace(source.SecretKeyName))
                throw new InvalidOperationException($"Source '{source.Name}' requiere un secret pero no tiene SecretKeyName configurado.");

            var secretValue = await _secretService.GetValueAsync(source.SecretKeyName);
            if (string.IsNullOrWhiteSpace(secretValue))
                throw new InvalidOperationException($"No se encontro el secret '{source.SecretKeyName}'. Configuralo en la pagina de Configuracion.");

            url = url.Replace("{secret}", Uri.EscapeDataString(secretValue));
        }

        var client = _httpClientFactory.CreateClient("SourceIngestion");
        _logger.LogInformation("Ingesting source {SourceName} from {Url}", source.Name, source.Url);

        var response = await client.GetAsync(url);
        response.EnsureSuccessStatusCode();
        var rawContent = await response.Content.ReadAsStringAsync();

        var parser = _parserFactory.GetParser(source.ComponentType);
        return parser.Parse(rawContent);
    }
}
