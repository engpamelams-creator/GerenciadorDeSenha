# GerenciadorDeSenha


# Site “Gerenciador de Senhas” 🔐

Bem-vindo ao repositório do projeto **Gerenciador de Senhas** — uma aplicação web moderna, 100% client-side, construída para gerar senhas seguras de forma fácil, rápida e confiável.

---

## 🎯 Objetivo  
Este site foi projetado para que qualquer pessoa, mesmo sem infraestrutura de banco ou servidor, consiga gerar senhas fortes e personalizadas. Ele roda completamente no navegador — sem armazenamento no servidor, sem cookies invasivos — e entrega uma interface elegante, responsiva e limpa nas cores preto/branco/verde, com um fundo animado que transmite tecnologia e segurança.

---

## 🧱 Arquitetura & Stack  
- **Monorepo** usando **Turborepo** para orquestrar os pacotes.  
  - `apps/web` → desenvolvido com **Next.js 14+** (App Router), sendo a aplicação principal onde as páginas de geração estão **sem** SSR.  
  - `packages/password-widget` → desenvolvido com **Angular 17+**, exportado como Web Component via **Angular Elements** (`<password-widget>`).  
- Linguagens e estilos: TypeScript para lógica, CSS Modules ou TailwindCSS para estilos, e animações leves em Canvas ou WebGL para o fundo interativo.  
- Integração opcional com APIs grátis: por exemplo, a API de Have I Been Pwned (k-anonymity) para checar se a hash prefix de uma senha aparece em vazamentos — **somente se ativada pelo usuário**.  
- Deploy recomendado: Vercel (para a parte Next.js) + bundle do Web Component Angular importado no build.

---

## 🔒 Requisitos de Segurança  
- Toda geração de senha ocorre localmente no cliente, usando `crypto.getRandomValues`.  
- **Nenhuma senha é salva** no servidor, no localStorage ou em cookies.  
- Um banner fixo alerta o usuário:  
  > “⚠️ As senhas geradas **não são salvas** no servidor. Copie e guarde em segurança.”  
- Um medidor de força calcula a entropia estimada da senha gerada, dando transparência ao usuário.  
- Funções de UI: Botões “Copiar”, “Regerar”, “Mostrar/Ocultar”.  
- Opção desativada por padrão: “Checar em vazamentos (HIBP)”.

---

## 🧭 Navegação & Fluxo  
O menu principal apresenta quatro categorias distintas (em forma de tabs ou cards):  
1. **Senha de E-mail**  
2. **Senha de Rede Social**  
3. **Senha de Wi-Fi**  
4. **Outros tipos de senha**  

Quando o usuário seleciona uma categoria, o componente `<password-widget>` é renderizado com os presets daquela categoria, e o usuário pode ajustar parâmetros finos de geração conforme desejar.

---

## 🧩 Regras de Geração por Categoria (Presets)  
- Para **todas** as categorias: permitir tamanho entre 8 e 64 caracteres, incluir/excluir letras maiúsculas, minúsculas, números e símbolos, e evitar caracteres ambíguos (`O,0,l,1,|`).  
- **E-mail**: 16–20 caracteres, ao menos 1 maiúscula, 1 minúscula, 1 número e 1 símbolo, e evitar sequências comuns.  
- **Rede Social**: 14–18 caracteres, mais símbolos permitidos, evitar repetição de caracteres mais de 2 vezes.  
- **Wi-Fi**: 20–32 caracteres, evitar símbolos de digitação confusa; opção de “frase de acesso” usando diceware local.  
- **Outros**: modo avançado com dicionário custom, grupos e pesos para geração mais sofisticada.

---

## 🎨 UI/UX & Estilo  
- Paleta de cores:
  - Fundo: `#000000` (preto)  
  - Texto principal: `#FFFFFF` (branco)  
  - Destaques: `#00FF88` ou `#00C67A` (verde)  
- Fundo animado com partículas ou linhas que reagem ao mouse ou ao scroll, rodando em Canvas/WebGL com alvo de 60 FPS, e degradando elegantemente em dispositivos mais lentos.  
- Layout com cards de cantos suaves, sombras discretas, micro-interações em hover/focus.  
- Acessibilidade em foco: marcações ARIA, contraste suficiente (AA/AAA), navegação por teclado e foco visível.  
- Responsividade garantida: mobile-first, grid fluido, evitando deslocamentos de layout (_layout shift_).

---

## 🧩 Integração Next.js + Angular  
- O pacote Angular é empacotado como Web Component (`password-widget.js` + CSS scoped).  
- Este Web Component é importado no projeto Next.js, sendo usado somente em componentes clientes (Client Components).  
- Exemplo de uso: `<password-widget category="email" length="16" useSymbols="true" …>`  
- O widget emite eventos customizados como `onGenerated`, `onCopied`, `onEntropyUpdate`, e aceita propriedades como `length`, `useSymbols`, etc.

---

## 📄 Páginas & Componentes (Next.js)  
- Página `/` (Home): apresenta hero com chamada “Gerar senha segura em segundos” e acesso direto às categorias.  
- Rotas: `/email`, `/social`, `/wifi`, `/outros` — cada uma carrega o widget com o preset correto.  
- Componentes reutilizáveis:
  - `Header` com logo/título + aviso de privacidade.  
  - `NavTabs` para navegar entre categorias.  
  - `BannerAviso` fixo para lembrar que senhas não são salvas.  
  - `Footer` com links extras, política simples e menção de código-fonte.

---

## 🧠 Lógica de Geração (no Web Component Angular)  
- Geração de bytes aleatórios via `crypto.getRandomValues`.  
- Mapeamento a conjuntos configuráveis de caracteres: `[A-Z] [a-z] [0-9] símbolos (!@#$%^&*_-+=?)`.  
- Validação pós-geração: aplicar regex para garantir mínimos definidos pelo preset; se não passar, gerar novamente (_re-roll_).  
- Cálculo de entropia: `log2(poolSize^length)` exibido em tempo real para o usuário entender a força da senha.  
- Para Wi-Fi: opção de gerar “frase de acesso” usando wordlist local (diceware) com separador `-`.  
- Bloqueio de padrões frágeis: evitar mais de 2 repetição de caracter, sequências lineares (`qwerty`, `1234`, `abcd`).

---

## 🧪 Testes & Qualidade  
- Função geradora testada via testes unitários (por exemplo Jest).  
- Meta de **Lighthouse ≥ 95** para Performance, Acessibilidade e Melhores Práticas.  
- Bundle Angular carregado sob demanda (_lazy-loaded_) para não aumentar o tamanho inicial da aplicação Next.js.

---

## 🛠️ Experiência de Desenvolvimento (DX)  
- Scripts úteis:
  - `npm run dev` → roda a aplicação Next.js junto com watch do pacote Angular.  
  - `npm run build` → compila o Angular Web Component, copia o bundle, e faz build do Next.js.  
- Estrutura sugerida:
