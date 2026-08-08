using Proyecto_Final.DTOs.NewsItems;

namespace Proyecto_Final.Services.Parsing;

// Strategy interface: one implementation per raw content format (json/xml/html).
// ContentParserFactory picks the concrete strategy at runtime based on Source.ComponentType.
public interface IContentParser
{
    string ComponentType { get; }
    IReadOnlyList<ParsedNewsItem> Parse(string rawContent);
}
