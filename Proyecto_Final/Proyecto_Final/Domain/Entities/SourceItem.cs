namespace Proyecto_Final.Domain.Entities;

// A single news item chosen by a user to be persisted. Json holds the full
// normalized payload (see ParsedNewsItem) so the item is self-contained and
// portable across groups' applications via Download/Upload.
public class SourceItem
{
    public int Id { get; set; }
    public int? SourceId { get; set; }
    public Source? Source { get; set; }

    public string Json { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string? SavedByUserId { get; set; }
}
