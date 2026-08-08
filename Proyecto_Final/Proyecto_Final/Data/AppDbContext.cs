using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Proyecto_Final.Domain.Entities;

namespace Proyecto_Final.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Source> Sources => Set<Source>();
    public DbSet<SourceItem> SourceItems => Set<SourceItem>();
    public DbSet<AppSecret> Secrets => Set<AppSecret>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Source>(e =>
        {
            e.ToTable("Sources");
            e.Property(s => s.Url).HasMaxLength(500).IsRequired();
            e.Property(s => s.Name).HasMaxLength(200).IsRequired();
            e.Property(s => s.Description).HasMaxLength(500);
            e.Property(s => s.ComponentType).HasMaxLength(100).IsRequired();
        });

        builder.Entity<SourceItem>(e =>
        {
            e.ToTable("SourceItems");
            e.Property(si => si.Json).IsRequired();
            e.HasOne(si => si.Source)
                .WithMany(s => s.SourceItems)
                .HasForeignKey(si => si.SourceId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<AppSecret>(e =>
        {
            e.ToTable("Secrets");
            e.HasIndex(s => s.Key).IsUnique();
            e.Property(s => s.Key).HasMaxLength(200).IsRequired();
            e.Property(s => s.EncryptedValue).IsRequired();
        });
    }
}
