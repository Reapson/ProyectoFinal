using Proyecto_Final.Data;
using Proyecto_Final.Repositories.Interfaces;

namespace Proyecto_Final.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;
    private ISourceRepository? _sources;
    private ISourceItemRepository? _sourceItems;

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
    }

    public ISourceRepository Sources => _sources ??= new SourceRepository(_context);
    public ISourceItemRepository SourceItems => _sourceItems ??= new SourceItemRepository(_context);

    public Task<int> SaveChangesAsync() => _context.SaveChangesAsync();

    public void Dispose() => _context.Dispose();
}
