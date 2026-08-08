using HtmlAgilityPack;
using Proyecto_Final.DTOs.NewsItems;

namespace Proyecto_Final.Services.Parsing;

// Parses a plain HTML page into ParsedNewsItem entries. Looks for <article>
// blocks first (common on news listing pages); falls back to a single item
// built from the page's OpenGraph/meta tags when no <article> is found.
public class HtmlContentParser : IContentParser
{
    public string ComponentType => "html";

    public IReadOnlyList<ParsedNewsItem> Parse(string rawContent)
    {
        var doc = new HtmlDocument();
        doc.LoadHtml(rawContent);

        var articles = doc.DocumentNode.SelectNodes("//article");
        if (articles is not null && articles.Count > 0)
        {
            var results = new List<ParsedNewsItem>();
            foreach (var article in articles)
            {
                var titleNode = article.SelectSingleNode(".//h1") ?? article.SelectSingleNode(".//h2") ?? article.SelectSingleNode(".//h3");
                var linkNode = article.SelectSingleNode(".//a[@href]");
                var imgNode = article.SelectSingleNode(".//img[@src]");
                var pNode = article.SelectSingleNode(".//p");

                results.Add(new ParsedNewsItem
                {
                    Title = HtmlEntity.DeEntitize(titleNode?.InnerText.Trim()) ?? "(sin titulo)",
                    Description = HtmlEntity.DeEntitize(pNode?.InnerText.Trim()),
                    Url = linkNode?.GetAttributeValue("href", null),
                    ImageUrl = imgNode?.GetAttributeValue("src", null)
                });
            }
            return results;
        }

        // Fallback: single-page item from <title> and meta description/og tags.
        var metaDescription = doc.DocumentNode.SelectSingleNode("//meta[@name='description']")?.GetAttributeValue("content", null)
            ?? doc.DocumentNode.SelectSingleNode("//meta[@property='og:description']")?.GetAttributeValue("content", null);
        var metaImage = doc.DocumentNode.SelectSingleNode("//meta[@property='og:image']")?.GetAttributeValue("content", null);
        var pageTitle = doc.DocumentNode.SelectSingleNode("//title")?.InnerText.Trim();

        return new List<ParsedNewsItem>
        {
            new()
            {
                Title = HtmlEntity.DeEntitize(pageTitle) ?? "(sin titulo)",
                Description = HtmlEntity.DeEntitize(metaDescription),
                ImageUrl = metaImage
            }
        };
    }
}
