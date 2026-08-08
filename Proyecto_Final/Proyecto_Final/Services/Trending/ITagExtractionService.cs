using Proyecto_Final.DTOs.NewsItems;
using Proyecto_Final.DTOs.Trending;

namespace Proyecto_Final.Services.Trending;

public interface ITagExtractionService
{
    List<string> ExtractKeywords(ParsedNewsItem item, int maxKeywords = 5);
    string ClassifySentiment(ParsedNewsItem item);
    TrendingReportDto BuildTrendingReport(IEnumerable<ParsedNewsItem> items, int topN = 10);
}
