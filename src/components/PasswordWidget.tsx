import { useState, useEffect } from 'react';
import { Copy, RefreshCw, Eye, EyeOff, Settings, Check, AlertTriangle } from 'lucide-react';
import {
  generatePassword,
  calculateEntropy,
  getPasswordStrength,
  checkHIBP,
  type PasswordConfig,
  type PasswordPreset,
} from '../utils/passwordGenerator';

interface PasswordWidgetProps {
  preset: PasswordPreset;
}

export function PasswordWidget({ preset }: PasswordWidgetProps) {
  const [password, setPassword] = useState('');
  const [config, setConfig] = useState<PasswordConfig>(preset.config);
  const [showPassword, setShowPassword] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [entropy, setEntropy] = useState(0);
  const [strength, setStrength] = useState({ level: '', color: '', percentage: 0 });
  const [enableHIBP, setEnableHIBP] = useState(false);
  const [hibpChecking, setHibpChecking] = useState(false);
  const [hibpResult, setHibpResult] = useState<{ breached: boolean; count: number } | null>(null);

  useEffect(() => {
    generateNewPassword();
  }, []);

  useEffect(() => {
    if (password) {
      const ent = calculateEntropy(password, config);
      setEntropy(ent);
      setStrength(getPasswordStrength(ent));
    }
  }, [password, config]);

  const generateNewPassword = () => {
    try {
      const newPassword = generatePassword(config);
      setPassword(newPassword);
      setHibpResult(null);
    } catch (error) {
      console.error('Error generating password:', error);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleCheckHIBP = async () => {
    if (!password) return;
    setHibpChecking(true);
    try {
      const result = await checkHIBP(password);
      setHibpResult(result);
    } catch (error) {
      console.error('HIBP check failed:', error);
    } finally {
      setHibpChecking(false);
    }
  };

  useEffect(() => {
    if (enableHIBP && password) {
      handleCheckHIBP();
    } else {
      setHibpResult(null);
    }
  }, [password, enableHIBP]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-zinc-900 rounded-lg shadow-2xl border border-zinc-800 overflow-hidden">
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">{preset.name}</h2>
          <p className="text-zinc-400 text-sm">{preset.description}</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div className="flex items-center gap-2 bg-black border border-zinc-700 rounded-lg p-4">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                readOnly
                className="flex-1 bg-transparent text-white text-lg font-mono outline-none"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 text-zinc-400 hover:text-white transition-colors"
                title={showPassword ? 'Ocultar' : 'Mostrar'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <button
                onClick={handleCopy}
                className="p-2 text-zinc-400 hover:text-green-500 transition-colors"
                title="Copiar"
              >
                {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
              </button>
              <button
                onClick={generateNewPassword}
                className="p-2 text-zinc-400 hover:text-green-500 transition-colors"
                title="Regerar"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">Força da senha:</span>
              <span className="font-semibold" style={{ color: strength.color }}>
                {strength.level}
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${strength.percentage}%`,
                  backgroundColor: strength.color,
                }}
              />
            </div>
            <p className="text-xs text-zinc-500">
              Entropia: {entropy.toFixed(1)} bits
            </p>
          </div>

          {hibpResult && (
            <div
              className={`p-3 rounded-lg border ${
                hibpResult.breached
                  ? 'bg-red-950 border-red-800 text-red-200'
                  : 'bg-green-950 border-green-800 text-green-200'
              }`}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  {hibpResult.breached ? (
                    <>
                      <strong>Senha comprometida!</strong>
                      <p>Esta senha foi encontrada {hibpResult.count.toLocaleString('pt-BR')} vezes em vazamentos de dados.</p>
                    </>
                  ) : (
                    <>
                      <strong>Senha segura</strong>
                      <p>Esta senha não foi encontrada em vazamentos conhecidos.</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={generateNewPassword}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Gerar Nova Senha
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="bg-zinc-800 hover:bg-zinc-700 text-white p-3 rounded-lg transition-colors"
              title="Configurações"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <h3 className="text-white font-semibold">Configurações</h3>

            <div className="space-y-3">
              <div>
                <label className="flex justify-between items-center text-sm text-zinc-300 mb-2">
                  <span>Tamanho: {config.length} caracteres</span>
                </label>
                <input
                  type="range"
                  min="8"
                  max="64"
                  value={config.length}
                  onChange={(e) => setConfig({ ...config, length: parseInt(e.target.value) })}
                  className="w-full accent-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.useUppercase}
                    onChange={(e) => setConfig({ ...config, useUppercase: e.target.checked })}
                    className="accent-green-500"
                  />
                  Maiúsculas (A-Z)
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.useLowercase}
                    onChange={(e) => setConfig({ ...config, useLowercase: e.target.checked })}
                    className="accent-green-500"
                  />
                  Minúsculas (a-z)
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.useNumbers}
                    onChange={(e) => setConfig({ ...config, useNumbers: e.target.checked })}
                    className="accent-green-500"
                  />
                  Números (0-9)
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.useSymbols}
                    onChange={(e) => setConfig({ ...config, useSymbols: e.target.checked })}
                    className="accent-green-500"
                  />
                  Símbolos (!@#$...)
                </label>
              </div>

              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.avoidAmbiguous}
                  onChange={(e) => setConfig({ ...config, avoidAmbiguous: e.target.checked })}
                  className="accent-green-500"
                />
                Evitar caracteres ambíguos (O, 0, l, 1, I, |)
              </label>

              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableHIBP}
                  onChange={(e) => setEnableHIBP(e.target.checked)}
                  className="accent-green-500"
                />
                Checar vazamentos (HIBP) - envia apenas prefixo de hash
              </label>

              {hibpChecking && (
                <p className="text-xs text-zinc-500">Verificando...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
