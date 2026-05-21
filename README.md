# Xbelt

App React para gestao de academias, estudios, boxes, pilates, lutas, quadras e escolinhas. Inclui landing page premium, painel administrativo, cadastro de academia/unidades, aluno vinculado a uma academia e portal do aluno.

## Stack

- Vite + React + TypeScript
- Supabase JS
- Recharts para graficos
- Lucide React para icones
- Framer Motion para animacoes sutis

## Rodar localmente

```bash
npm install
npm run dev
```

O app abre em `http://localhost:8080`.

## Supabase

1. Crie um projeto no Supabase.
2. Rode o SQL em `supabase/schema.sql` no SQL Editor.
3. Copie `.env.example` para `.env`.
4. Preencha:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-anon
```

O formulario de demonstracao grava em `demo_leads`. O cadastro de academia grava em `organizations` e cria a unidade principal em `locations`. O cadastro de aluno grava em `students` com `organization_id` e `location_id`, mantendo o aluno ligado a uma academia.

As policies anon para `organizations`, `locations` e `students` existem apenas para prototipo. Em producao, remova essas policies e adicione autenticacao para o painel de gestao.

Nunca coloque a `service_role` em arquivos do Vite, no navegador ou em variaveis publicas da Vercel. Ela deve ficar apenas em backend seguro, Edge Functions ou ambiente server-side. Se essa chave for exposta fora do ambiente controlado, gere uma nova no painel do Supabase antes de ir para producao.

## Publicar na Vercel

Build command:

```bash
npm run build
```

Output directory:

```bash
dist
```

Configure as mesmas variaveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no painel da Vercel.
