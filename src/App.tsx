import { useState } from 'react';
import { AnimatedBackground } from './components/AnimatedBackground';
import { Header } from './components/Header';
import { WarningBanner } from './components/WarningBanner';
import { CategoryNav, CategoryType } from './components/CategoryNav';
import { PasswordWidget } from './components/PasswordWidget';
import { Footer } from './components/Footer';
import { presets } from './utils/passwordGenerator';

function App() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('email');

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />

      <Header />
      <WarningBanner />

      <main className="flex-1 w-full py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 md:space-y-12">
          <section className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Gere senhas fortes, rápidas e privadas
            </h2>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
              Direto no seu navegador. Sem armazenamento. Totalmente seguro.
            </p>
          </section>

          <CategoryNav
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          <div className="flex justify-center">
            <PasswordWidget
              preset={presets[activeCategory]}
            />
          </div>

          <section className="max-w-3xl mx-auto">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Por que usar este gerador?</h3>
              <ul className="space-y-3 text-zinc-300">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 font-bold">✓</span>
                  <span><strong>100% privado:</strong> Senhas geradas localmente no seu navegador</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 font-bold">✓</span>
                  <span><strong>Segurança máxima:</strong> Usa crypto.getRandomValues para aleatoriedade criptográfica</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 font-bold">✓</span>
                  <span><strong>Presets inteligentes:</strong> Configurações otimizadas para cada tipo de conta</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 font-bold">✓</span>
                  <span><strong>Verificação HIBP:</strong> Opcionalmente verifica se a senha foi vazada (apenas hash prefix)</span>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
