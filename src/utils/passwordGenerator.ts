export interface PasswordConfig {
  length: number;
  useUppercase: boolean;
  useLowercase: boolean;
  useNumbers: boolean;
  useSymbols: boolean;
  avoidAmbiguous: boolean;
  minUppercase?: number;
  minLowercase?: number;
  minNumbers?: number;
  minSymbols?: number;
  avoidRepeats?: boolean;
  maxRepeats?: number;
}

export interface PasswordPreset {
  name: string;
  description: string;
  config: PasswordConfig;
}

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*_-+=?';
const AMBIGUOUS = 'O0l1I|';

const KEYBOARD_PATTERNS = ['qwerty', 'asdfgh', 'zxcvbn', '123456', 'abcdef'];

function getCharPool(config: PasswordConfig): string {
  let pool = '';
  if (config.useUppercase) pool += UPPERCASE;
  if (config.useLowercase) pool += LOWERCASE;
  if (config.useNumbers) pool += NUMBERS;
  if (config.useSymbols) pool += SYMBOLS;

  if (config.avoidAmbiguous) {
    pool = pool.split('').filter(char => !AMBIGUOUS.includes(char)).join('');
  }

  return pool;
}

function getSecureRandomInt(max: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

function hasKeyboardPattern(password: string): boolean {
  const lowerPass = password.toLowerCase();
  return KEYBOARD_PATTERNS.some(pattern =>
    lowerPass.includes(pattern) || lowerPass.includes(pattern.split('').reverse().join(''))
  );
}

function hasConsecutiveRepeats(password: string, maxRepeats: number): boolean {
  for (let i = 0; i < password.length - maxRepeats; i++) {
    const char = password[i];
    let count = 1;
    for (let j = i + 1; j < password.length && password[j] === char; j++) {
      count++;
      if (count > maxRepeats) return true;
    }
  }
  return false;
}

function meetsRequirements(password: string, config: PasswordConfig): boolean {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*_\-+=?]/.test(password);

  if (config.useUppercase && !hasUpper) return false;
  if (config.useLowercase && !hasLower) return false;
  if (config.useNumbers && !hasNumber) return false;
  if (config.useSymbols && !hasSymbol) return false;

  if (config.minUppercase) {
    const count = (password.match(/[A-Z]/g) || []).length;
    if (count < config.minUppercase) return false;
  }
  if (config.minLowercase) {
    const count = (password.match(/[a-z]/g) || []).length;
    if (count < config.minLowercase) return false;
  }
  if (config.minNumbers) {
    const count = (password.match(/[0-9]/g) || []).length;
    if (count < config.minNumbers) return false;
  }
  if (config.minSymbols) {
    const count = (password.match(/[!@#$%^&*_\-+=?]/g) || []).length;
    if (count < config.minSymbols) return false;
  }

  if (hasKeyboardPattern(password)) return false;

  if (config.avoidRepeats && config.maxRepeats) {
    if (hasConsecutiveRepeats(password, config.maxRepeats)) return false;
  }

  return true;
}

export function generatePassword(config: PasswordConfig): string {
  const pool = getCharPool(config);
  if (pool.length === 0) {
    throw new Error('Character pool is empty. Enable at least one character type.');
  }

  let attempts = 0;
  const maxAttempts = 1000;

  while (attempts < maxAttempts) {
    let password = '';
    for (let i = 0; i < config.length; i++) {
      const randomIndex = getSecureRandomInt(pool.length);
      password += pool[randomIndex];
    }

    if (meetsRequirements(password, config)) {
      return password;
    }

    attempts++;
  }

  throw new Error('Could not generate password meeting requirements after maximum attempts.');
}

export function calculateEntropy(password: string, config: PasswordConfig): number {
  const pool = getCharPool(config);
  return password.length * Math.log2(pool.length);
}

export function getPasswordStrength(entropy: number): { level: string; color: string; percentage: number } {
  if (entropy < 28) {
    return { level: 'Muito Fraca', color: '#ff4444', percentage: 20 };
  } else if (entropy < 36) {
    return { level: 'Fraca', color: '#ff8844', percentage: 40 };
  } else if (entropy < 60) {
    return { level: 'Razoável', color: '#ffcc44', percentage: 60 };
  } else if (entropy < 128) {
    return { level: 'Forte', color: '#00FF88', percentage: 80 };
  } else {
    return { level: 'Muito Forte', color: '#00FF88', percentage: 100 };
  }
}

export async function sha1(str: string): Promise<string> {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export async function checkHIBP(password: string): Promise<{ breached: boolean; count: number }> {
  try {
    const hash = await sha1(password);
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) {
      throw new Error('HIBP API error');
    }

    const text = await response.text();
    const lines = text.split('\n');

    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(':');
      if (hashSuffix === suffix) {
        return { breached: true, count: parseInt(countStr, 10) };
      }
    }

    return { breached: false, count: 0 };
  } catch (error) {
    throw new Error('Failed to check password against breach database');
  }
}

export const presets: Record<string, PasswordPreset> = {
  email: {
    name: 'Senha de E-mail',
    description: 'Senhas fortes para contas de e-mail (16-20 caracteres)',
    config: {
      length: 18,
      useUppercase: true,
      useLowercase: true,
      useNumbers: true,
      useSymbols: true,
      avoidAmbiguous: true,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      avoidRepeats: true,
      maxRepeats: 2,
    },
  },
  social: {
    name: 'Senha de Rede Social',
    description: 'Senhas para redes sociais (14-18 caracteres)',
    config: {
      length: 16,
      useUppercase: true,
      useLowercase: true,
      useNumbers: true,
      useSymbols: true,
      avoidAmbiguous: true,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 2,
      avoidRepeats: true,
      maxRepeats: 2,
    },
  },
  wifi: {
    name: 'Senha de Wi-Fi',
    description: 'Senhas longas e seguras para redes Wi-Fi (20-32 caracteres)',
    config: {
      length: 24,
      useUppercase: true,
      useLowercase: true,
      useNumbers: true,
      useSymbols: false,
      avoidAmbiguous: true,
      minUppercase: 2,
      minLowercase: 2,
      minNumbers: 2,
      avoidRepeats: true,
      maxRepeats: 2,
    },
  },
  custom: {
    name: 'Outros Tipos de Senha',
    description: 'Configuração personalizada para qualquer uso',
    config: {
      length: 16,
      useUppercase: true,
      useLowercase: true,
      useNumbers: true,
      useSymbols: true,
      avoidAmbiguous: true,
      avoidRepeats: true,
      maxRepeats: 2,
    },
  },
};
