using Proyecto_Final.Domain.Entities;

namespace Proyecto_Final.Services.Auth;

public interface IJwtTokenService
{
    (string Token, DateTime ExpiresAt) GenerateToken(ApplicationUser user, IList<string> roles);
}
