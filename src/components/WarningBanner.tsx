import { AlertTriangle } from 'lucide-react';

export function WarningBanner() {
  return (
    <div className="w-full bg-zinc-900 border-y border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3 text-yellow-400">
          <AlertTriangle size={20} className="flex-shrink-0" />
          <p className="text-sm">
            <strong>Importante:</strong> As senhas geradas <strong>não são salvas</strong> no servidor.
            Copie e guarde em segurança em um gerenciador de senhas confiável.
          </p>
        </div>
      </div>
    </div>
  );
}
