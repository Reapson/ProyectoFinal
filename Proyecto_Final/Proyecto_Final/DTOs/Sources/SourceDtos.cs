using System.ComponentModel.DataAnnotations;

namespace Proyecto_Final.DTOs.Sources;

public class SourceDto
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ComponentType { get; set; } = string.Empty;
    public bool RequiresSecret { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateSourceDto
{
    [Required, Url] public string Url { get; set; } = string.Empty;
    [Required] public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    [Required]
    [RegularExpression("json|xml|html", ErrorMessage = "ComponentType must be 'json', 'xml' or 'html'.")]
    public string ComponentType { get; set; } = "json";

    public bool RequiresSecret { get; set; }
    public string? SecretKeyName { get; set; }
}
