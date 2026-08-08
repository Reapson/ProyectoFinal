namespace Proyecto_Final.DTOs.Trending;

public class TrendingReportDto
{
    public int TotalItemsAnalyzed { get; set; }
    public List<TrendingTagDto> TopKeywords { get; set; } = new();
    public Dictionary<string, int> SentimentBreakdown { get; set; } = new();
}

public class TrendingTagDto
{
    public string Keyword { get; set; } = string.Empty;
    public int Occurrences { get; set; }
}
