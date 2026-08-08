using Microsoft.EntityFrameworkCore;
using Proyecto_Final.Data;
using Proyecto_Final.Domain.Entities;
using Proyecto_Final.Repositories.Interfaces;

namespace Proyecto_Final.Repositories;

public class SourceItemRepository : GenericRepository<SourceItem>, ISourceItemRepository
{
    public SourceItemRepository(AppDbContext context) : base(context) { }

    public async Task<IReadOnlyList<SourceItem>> GetAllWithSourceAsync() =>
        await DbSet.Include(si => si.Source).AsNoTracking()
            .OrderByDescending(si => si.CreatedAt)
            .ToListAsync();

    public async Task<SourceItem?> GetByIdWithSourceAsync(int id) =>
        await DbSet.Include(si => si.Source).FirstOrDefaultAsync(si => si.Id == id);
}
