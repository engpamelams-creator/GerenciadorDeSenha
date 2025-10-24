import { Shield } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full border-b border-zinc-800 bg-black/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-3">
          <Shield className="text-green-500" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-white">Gerador de Senhas Seguras</h1>
            <p className="text-xs text-zinc-400">100% client-side • Privado e seguro</p>
          </div>
        </div>
      </div>
    </header>
  );
}
