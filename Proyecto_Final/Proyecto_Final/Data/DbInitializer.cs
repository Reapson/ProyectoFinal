using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Proyecto_Final.Domain.Entities;

namespace Proyecto_Final.Data;

// Seeds roles, a default Admin user and demo Sources (JSON via NewsAPI.org
// which RequiresSecret, and a public XML/RSS feed which does not) so the
// ingestion pipeline (JSON/XML/HTML parsing strategies) has something to
// demo out of the box.
public static class DbInitializer
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var context = services.GetRequiredService<AppDbContext>();
        await context.Database.MigrateAsync();

        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        foreach (var role in new[] { "Admin", "User" })
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        const string adminEmail = "admin@proyectofinal.com";
        var admin = await userManager.FindByEmailAsync(adminEmail);
        if (admin is null)
        {
            admin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                DisplayName = "Administrador",
                EmailConfirmed = true
            };
            var result = await userManager.CreateAsync(admin, "Admin123!");
            if (result.Succeeded)
                await userManager.AddToRoleAsync(admin, "Admin");
        }

        if (!context.Sources.Any())
        {
            context.Sources.AddRange(
                new Source
                {
                    Name = "NewsAPI - Top Headlines",
                    Url = "https://newsapi.org/v2/top-headlines?country=us&apiKey={secret}",
                    Description = "Titulares de noticias en formato JSON (requiere API key).",
                    ComponentType = "json",
                    RequiresSecret = true,
                    SecretKeyName = "NewsApiKey"
                },
                new Source
                {
                    Name = "NYTimes - RSS World",
                    Url = "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
                    Description = "Feed RSS/XML publico de noticias mundiales, sin llave requerida.",
                    ComponentType = "xml",
                    RequiresSecret = false
                }
            );
            await context.SaveChangesAsync();
        }
    }
}
