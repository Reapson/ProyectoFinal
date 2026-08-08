namespace Proyecto_Final.Domain.Entities;

// Generic key/value store for admin-managed secrets and settings
// (e.g. NewsAPI keys). Value is encrypted at rest via IDataProtector.
public class AppSecret
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string EncryptedValue { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
