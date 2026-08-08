using Proyecto_Final.Domain.Entities;

namespace Proyecto_Final.Repositories.Interfaces;

public interface ISourceItemRepository : IGenericRepository<SourceItem>
{
    Task<IReadOnlyList<SourceItem>> GetAllWithSourceAsync();
    Task<SourceItem?> GetByIdWithSourceAsync(int id);
}
