namespace Proyecto_Final.Domain.Entities;

// Represents an external data source (news API, RSS feed, HTML page, etc.)
// added by an Admin. ComponentType tells the ContentParserFactory which
// IContentParser strategy to use when ingesting content from Url.
public class Source
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    // 'json' | 'xml' | 'html' -> selects the parsing strategy
    public string ComponentType { get; set; } = "json";

    public bool RequiresSecret { get; set; }

    // Name of the AppSecret entry that holds the API key for this source (nullable when RequiresSecret = false)
    public string? SecretKeyName { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<SourceItem> SourceItems { get; set; } = new List<SourceItem>();
}
