using System.Xml.Linq;
using Proyecto_Final.DTOs.NewsItems;

namespace Proyecto_Final.Services.Parsing;

// Parses RSS 2.0 / Atom XML feeds into ParsedNewsItem.
public class XmlContentParser : IContentParser
{
    public string ComponentType => "xml";

    public IReadOnlyList<ParsedNewsItem> Parse(string rawContent)
    {
        var doc = XDocument.Parse(rawContent);
        var results = new List<ParsedNewsItem>();

        // RSS 2.0: <rss><channel><item>...
        var rssItems = doc.Descendants("item").ToList();
        if (rssItems.Count > 0)
        {
            foreach (var item in rssItems)
            {
                results.Add(new ParsedNewsItem
                {
                    Title = item.Element("title")?.Value ?? "(sin titulo)",
                    Description = item.Element("description")?.Value,
                    Url = item.Element("link")?.Value,
                    Author = item.Element("author")?.Value,
                    PublishedAt = DateTime.TryParse(item.Element("pubDate")?.Value, out var d) ? d : null
                });
            }
            return results;
        }

        // Atom: <feed><entry>...
        XNamespace atom = "http://www.w3.org/2005/Atom";
        var atomEntries = doc.Descendants(atom + "entry").ToList();
        foreach (var entry in atomEntries)
        {
            results.Add(new ParsedNewsItem
            {
                Title = entry.Element(atom + "title")?.Value ?? "(sin titulo)",
                Description = entry.Element(atom + "summary")?.Value,
                Url = entry.Element(atom + "link")?.Attribute("href")?.Value,
                Author = entry.Element(atom + "author")?.Element(atom + "name")?.Value,
                PublishedAt = DateTime.TryParse(entry.Element(atom + "updated")?.Value, out var d) ? d : null
            });
        }

        return results;
    }
}
