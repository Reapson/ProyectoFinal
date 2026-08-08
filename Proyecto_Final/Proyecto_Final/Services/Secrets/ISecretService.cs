using Proyecto_Final.DTOs.Config;

namespace Proyecto_Final.Services.Secrets;

public interface ISecretService
{
    Task<IReadOnlyList<SecretDto>> GetAllAsync();
    Task<string?> GetValueAsync(string key);
    Task UpsertAsync(UpsertSecretDto dto);
    Task DeleteAsync(string key);
}
