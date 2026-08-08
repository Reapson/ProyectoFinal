using System.ComponentModel.DataAnnotations;

namespace Proyecto_Final.DTOs.Config;

public class SecretDto
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Value is never returned in full; masked for display in the config UI.
    public string MaskedValue { get; set; } = string.Empty;
}

public class UpsertSecretDto
{
    [Required] public string Key { get; set; } = string.Empty;
    [Required] public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
}
