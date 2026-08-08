using System.ComponentModel.DataAnnotations;
using Proyecto_Final.DTOs.NewsItems;

namespace Proyecto_Final.DTOs.SourceItems;

public class SourceItemDto
{
    public int Id { get; set; }
    public int? SourceId { get; set; }
    public string? SourceName { get; set; }
    public ParsedNewsItem Item { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

// Item as returned live from a Source before the user decides to save it (no DB Id yet).
public class LiveNewsItemDto
{
    public int SourceId { get; set; }
    public string SourceName { get; set; } = string.Empty;
    public ParsedNewsItem Item { get; set; } = new();
}

public class SaveItemDto
{
    [Required] public int SourceId { get; set; }
    [Required] public ParsedNewsItem Item { get; set; } = new();
}

// Cross-group interoperable export/import envelope. Any group's app can
// download this JSON and upload it into their own DB: it carries enough
// Source metadata to create/match a Source plus the normalized item itself.
public class ExportEnvelopeDto
{
    public string SchemaVersion { get; set; } = "1.0";
    public DateTime ExportedAt { get; set; } = DateTime.UtcNow;
    public ExportedSourceDto Source { get; set; } = new();
    public ParsedNewsItem Item { get; set; } = new();
}

public class ExportedSourceDto
{
    public string Url { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ComponentType { get; set; } = "json";
}
