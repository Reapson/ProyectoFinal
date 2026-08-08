using System.Text.Json;
using Proyecto_Final.DTOs.NewsItems;

namespace Proyecto_Final.Services.Parsing;

// Parses JSON API responses shaped like NewsAPI.org ({ "articles": [...] })
// or any object/array exposing a collection under a common property name
// ("articles", "items", "results", "data"), tolerating differing field names.
public class JsonContentParser : IContentParser
{
    public string ComponentType => "json";

    public IReadOnlyList<ParsedNewsItem> Parse(string rawContent)
    {
        using var doc = JsonDocument.Parse(rawContent);
        var root = doc.RootElement;

        var arrayElement = root.ValueKind switch
        {
            JsonValueKind.Array => root,
            JsonValueKind.Object => FindArrayProperty(root),
            _ => (JsonElement?)null
        };

        if (arrayElement is null)
            return Array.Empty<ParsedNewsItem>();

        var results = new List<ParsedNewsItem>();
        foreach (var element in arrayElement.Value.EnumerateArray())
        {
            results.Add(new ParsedNewsItem
            {
                Title = GetString(element, "title", "name", "headline") ?? "(sin titulo)",
                Description = GetString(element, "description", "summary", "excerpt"),
                Content = GetString(element, "content", "body"),
                Url = GetString(element, "url", "link"),
                ImageUrl = GetString(element, "urlToImage", "image", "imageUrl", "thumbnail"),
                Author = GetString(element, "author", "creator"),
                PublishedAt = GetDate(element, "publishedAt", "pubDate", "date")
            });
        }

        return results;
    }

    private static JsonElement? FindArrayProperty(JsonElement obj)
    {
        foreach (var name in new[] { "articles", "items", "results", "data", "entries" })
        {
            if (obj.TryGetProperty(name, out var prop) && prop.ValueKind == JsonValueKind.Array)
                return prop;
        }
        return null;
    }

    private static string? GetString(JsonElement element, params string[] propertyNames)
    {
        foreach (var name in propertyNames)
        {
            if (element.TryGetProperty(name, out var prop) && prop.ValueKind == JsonValueKind.String)
                return prop.GetString();
        }
        return null;
    }

    private static DateTime? GetDate(JsonElement element, params string[] propertyNames)
    {
        var value = GetString(element, propertyNames);
        return DateTime.TryParse(value, out var parsed) ? parsed : null;
    }
}
