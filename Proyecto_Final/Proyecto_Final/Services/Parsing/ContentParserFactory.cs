namespace Proyecto_Final.Services.Parsing;

public interface IContentParserFactory
{
    IContentParser GetParser(string componentType);
}

// Factory pattern: resolves the right IContentParser strategy for a Source.ComponentType.
public class ContentParserFactory : IContentParserFactory
{
    private readonly IEnumerable<IContentParser> _parsers;

    public ContentParserFactory(IEnumerable<IContentParser> parsers)
    {
        _parsers = parsers;
    }

    public IContentParser GetParser(string componentType)
    {
        var parser = _parsers.FirstOrDefault(p =>
            string.Equals(p.ComponentType, componentType, StringComparison.OrdinalIgnoreCase));

        if (parser is null)
            throw new NotSupportedException($"No hay un IContentParser registrado para ComponentType '{componentType}'.");

        return parser;
    }
}
