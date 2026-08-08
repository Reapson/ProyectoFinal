namespace Proyecto_Final.DTOs.NewsItems;

// Normalized shape every IContentParser strategy converts raw JSON/XML/HTML into,
// regardless of the original source format. This is what SourceItem.Json stores.
public class ParsedNewsItem
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Content { get; set; }
    public string? Url { get; set; }
    public string? ImageUrl { get; set; }
    public string? Author { get; set; }
    public DateTime? PublishedAt { get; set; }
    public List<string> Tags { get; set; } = new();
}
