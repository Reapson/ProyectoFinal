using System.Text.RegularExpressions;
using Proyecto_Final.DTOs.NewsItems;
using Proyecto_Final.DTOs.Trending;

namespace Proyecto_Final.Services.Trending;

// Elemento Sorpresa: analiza los items ingeridos/guardados para extraer
// palabras clave (frecuencia de terminos, sin stopwords) y un sentimiento
// naive (positivo/negativo/neutral por conteo de palabras). Alimenta el
// endpoint GET /api/trending para mostrar "temas del momento" en el frontend.
public class TagExtractionService : ITagExtractionService
{
    private static readonly HashSet<string> StopWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "the","a","an","of","in","on","for","to","and","or","is","are","was","were","with","by","at","as","that","this",
        "el","la","los","las","de","del","en","y","o","un","una","que","por","para","con","se","su","sus","es","son",
        "al","lo","como","mas","pero","sin","sobre"
    };

    private static readonly string[] PositiveWords = { "win", "growth", "success", "record", "boost", "gain", "recovery", "peace", "breakthrough" };
    private static readonly string[] NegativeWords = { "crisis", "war", "conflict", "death", "attack", "crash", "loss", "decline", "threat", "disaster" };

    public List<string> ExtractKeywords(ParsedNewsItem item, int maxKeywords = 5)
    {
        var text = $"{item.Title} {item.Description}";
        var words = Regex.Matches(text, @"[A-Za-zÁÉÍÓÚáéíóúÑñ]{4,}")
            .Select(m => m.Value.ToLowerInvariant())
            .Where(w => !StopWords.Contains(w));

        return words
            .GroupBy(w => w)
            .OrderByDescending(g => g.Count())
            .Take(maxKeywords)
            .Select(g => g.Key)
            .ToList();
    }

    public string ClassifySentiment(ParsedNewsItem item)
    {
        var text = $"{item.Title} {item.Description}".ToLowerInvariant();
        var positiveScore = PositiveWords.Count(w => text.Contains(w));
        var negativeScore = NegativeWords.Count(w => text.Contains(w));

        if (positiveScore == negativeScore) return "neutral";
        return positiveScore > negativeScore ? "positivo" : "negativo";
    }

    public TrendingReportDto BuildTrendingReport(IEnumerable<ParsedNewsItem> items, int topN = 10)
    {
        var itemList = items.ToList();
        var keywordCounts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        var sentimentCounts = new Dictionary<string, int>();

        foreach (var item in itemList)
        {
            foreach (var keyword in ExtractKeywords(item, maxKeywords: 8))
                keywordCounts[keyword] = keywordCounts.GetValueOrDefault(keyword) + 1;

            var sentiment = ClassifySentiment(item);
            sentimentCounts[sentiment] = sentimentCounts.GetValueOrDefault(sentiment) + 1;
        }

        return new TrendingReportDto
        {
            TotalItemsAnalyzed = itemList.Count,
            TopKeywords = keywordCounts
                .OrderByDescending(kv => kv.Value)
                .Take(topN)
                .Select(kv => new TrendingTagDto { Keyword = kv.Key, Occurrences = kv.Value })
                .ToList(),
            SentimentBreakdown = sentimentCounts
        };
    }
}
