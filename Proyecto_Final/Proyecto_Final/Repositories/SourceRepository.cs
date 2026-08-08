using Microsoft.EntityFrameworkCore;
using Proyecto_Final.Data;
using Proyecto_Final.Domain.Entities;
using Proyecto_Final.Repositories.Interfaces;

namespace Proyecto_Final.Repositories;

public class SourceRepository : GenericRepository<Source>, ISourceRepository
{
    public SourceRepository(AppDbContext context) : base(context) { }

    public async Task<Source?> GetByUrlAsync(string url) =>
        await DbSet.FirstOrDefaultAsync(s => s.Url == url);
}
