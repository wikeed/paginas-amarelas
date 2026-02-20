interface PublicProfileStatsProps {
  total: number;
  aLer: number;
  lendo: number;
  lido: number;
}

export function PublicProfileStats({ total, aLer, lendo, lido }: PublicProfileStatsProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-primary/50 border border-border-color rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-secondary">{total}</div>
          <div className="text-xs text-text-muted mt-1">Total</div>
        </div>

        <div className="bg-primary/50 border border-border-color rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{aLer}</div>
          <div className="text-xs text-text-muted mt-1">A ler</div>
        </div>

        <div className="bg-primary/50 border border-border-color rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-cyan-400">{lendo}</div>
          <div className="text-xs text-text-muted mt-1">Lendo</div>
        </div>

        <div className="bg-primary/50 border border-border-color rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{lido}</div>
          <div className="text-xs text-text-muted mt-1">Lidos</div>
        </div>
      </div>
    </div>
  );
}
