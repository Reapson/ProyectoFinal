using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Proyecto_Final.Data;
using Proyecto_Final.Domain.Entities;
using Proyecto_Final.DTOs.Config;

namespace Proyecto_Final.Services.Secrets;

// Encrypts secret values at rest using ASP.NET Core's Data Protection API,
// so raw API keys (e.g. NewsAPI key) never sit in plain text in the DB.
public class SecretService : ISecretService
{
    private readonly AppDbContext _context;
    private readonly IDataProtector _protector;

    public SecretService(AppDbContext context, IDataProtectionProvider dataProtectionProvider)
    {
        _context = context;
        _protector = dataProtectionProvider.CreateProtector("Proyecto_Final.Secrets.v1");
    }

    public async Task<IReadOnlyList<SecretDto>> GetAllAsync()
    {
        var secrets = await _context.Secrets.AsNoTracking().ToListAsync();
        return secrets.Select(ToDto).ToList();
    }

    public async Task<string?> GetValueAsync(string key)
    {
        var secret = await _context.Secrets.AsNoTracking().FirstOrDefaultAsync(s => s.Key == key);
        return secret is null ? null : _protector.Unprotect(secret.EncryptedValue);
    }

    public async Task UpsertAsync(UpsertSecretDto dto)
    {
        var existing = await _context.Secrets.FirstOrDefaultAsync(s => s.Key == dto.Key);
        var encrypted = _protector.Protect(dto.Value);

        if (existing is null)
        {
            _context.Secrets.Add(new AppSecret
            {
                Key = dto.Key,
                EncryptedValue = encrypted,
                Description = dto.Description,
                UpdatedAt = DateTime.UtcNow
            });
        }
        else
        {
            existing.EncryptedValue = encrypted;
            existing.Description = dto.Description;
            existing.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(string key)
    {
        var existing = await _context.Secrets.FirstOrDefaultAsync(s => s.Key == key);
        if (existing is not null)
        {
            _context.Secrets.Remove(existing);
            await _context.SaveChangesAsync();
        }
    }

    private static SecretDto ToDto(AppSecret secret) => new()
    {
        Id = secret.Id,
        Key = secret.Key,
        Description = secret.Description,
        UpdatedAt = secret.UpdatedAt,
        MaskedValue = "••••••••"
    };
}
