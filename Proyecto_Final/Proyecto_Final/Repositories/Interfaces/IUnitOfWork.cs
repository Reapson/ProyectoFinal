namespace Proyecto_Final.Repositories.Interfaces;

public interface IUnitOfWork : IDisposable
{
    ISourceRepository Sources { get; }
    ISourceItemRepository SourceItems { get; }
    Task<int> SaveChangesAsync();
}
