import React from 'react';

export function Footer() {
  return (
    <footer className="bg-transparent py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-zinc-400">
        <p>© {new Date().getFullYear()} — Criado por Dev Pamela M.S</p>
      </div>
    </footer>
  );
}
