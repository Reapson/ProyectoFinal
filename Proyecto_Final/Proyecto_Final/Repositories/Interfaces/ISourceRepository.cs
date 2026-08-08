using Proyecto_Final.Domain.Entities;

namespace Proyecto_Final.Repositories.Interfaces;

public interface ISourceRepository : IGenericRepository<Source>
{
    Task<Source?> GetByUrlAsync(string url);
}
