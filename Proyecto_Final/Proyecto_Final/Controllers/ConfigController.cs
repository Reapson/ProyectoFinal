using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Proyecto_Final.Domain.Entities;
using Proyecto_Final.DTOs.Auth;
using Proyecto_Final.DTOs.Config;
using Proyecto_Final.Services.Secrets;

namespace Proyecto_Final.Controllers;

// Pagina de configuracion del PDF: 3.1 Asignar roles, 3.2 Guardar SECRETS.
// Todo el controlador es exclusivo de Admin.
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ConfigController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly ISecretService _secretService;

    public ConfigController(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        ISecretService secretService)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _secretService = secretService;
    }

    [HttpGet("roles")]
    public ActionResult<IEnumerable<string>> GetRoles() =>
        Ok(_roleManager.Roles.Select(r => r.Name));

    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<UserSummaryDto>>> GetUsers()
    {
        var users = _userManager.Users.ToList();
        var result = new List<UserSummaryDto>();
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            result.Add(new UserSummaryDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                DisplayName = user.DisplayName,
                Roles = roles.ToList()
            });
        }
        return Ok(result);
    }

    [HttpPost("users/assign-role")]
    public async Task<IActionResult> AssignRole(AssignRoleDto dto)
    {
        var user = await _userManager.FindByIdAsync(dto.UserId);
        if (user is null) return NotFound("Usuario no encontrado.");

        if (!await _roleManager.RoleExistsAsync(dto.Role))
            return BadRequest($"El rol '{dto.Role}' no existe.");

        if (await _userManager.IsInRoleAsync(user, dto.Role))
            return Ok("El usuario ya tiene ese rol.");

        var result = await _userManager.AddToRoleAsync(user, dto.Role);
        return result.Succeeded ? Ok() : BadRequest(result.Errors.Select(e => e.Description));
    }

    [HttpPost("users/remove-role")]
    public async Task<IActionResult> RemoveRole(AssignRoleDto dto)
    {
        var user = await _userManager.FindByIdAsync(dto.UserId);
        if (user is null) return NotFound("Usuario no encontrado.");

        var result = await _userManager.RemoveFromRoleAsync(user, dto.Role);
        return result.Succeeded ? Ok() : BadRequest(result.Errors.Select(e => e.Description));
    }

    [HttpGet("secrets")]
    public async Task<ActionResult<IEnumerable<SecretDto>>> GetSecrets() =>
        Ok(await _secretService.GetAllAsync());

    [HttpPost("secrets")]
    public async Task<IActionResult> UpsertSecret(UpsertSecretDto dto)
    {
        await _secretService.UpsertAsync(dto);
        return Ok();
    }

    [HttpDelete("secrets/{key}")]
    public async Task<IActionResult> DeleteSecret(string key)
    {
        await _secretService.DeleteAsync(key);
        return NoContent();
    }
}
