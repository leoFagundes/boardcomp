# BoardComp 🎲

Plataforma de competição de jogos de tabuleiro entre **Funcionários Antigos** e **Funcionários Novos**.

## Stack

- **Next.js 14** — App Router + Server/Client Components
- **TypeScript** — Tipagem estrita em todo o projeto
- **TailwindCSS** — Estilização utilitária com tema customizado
- **Firebase Auth** — Autenticação de usuários
- **Firestore** — Banco de dados NoSQL em tempo real

---

## Configuração do Projeto

### 1. Clone e instale dependências

```bash
git clone <repo>
cd boardcomp
npm install
```

### 2. Configure o Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Crie um novo projeto
3. Ative **Authentication** → Email/Senha
4. Ative **Firestore Database** (modo produção)
5. Copie as credenciais do projeto

### 3. Configure as variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Preencha com suas credenciais Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 4. Configure as regras do Firestore

Instale o Firebase CLI e faça deploy das regras:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
# Aponte para lib/firebase/rules.firestore quando perguntado
firebase deploy --only firestore:rules
```

### 5. Inicialize as equipes no Firestore

Crie manualmente duas coleções no Firestore Console ou execute este script uma vez:

Coleção `teams`, documentos:

```json
// teams/antigos
{
  "id": "antigos",
  "name": "Funcionários Antigos",
  "points": 0,
  "wins": 0,
  "memberCount": 0
}

// teams/novos
{
  "id": "novos",
  "name": "Funcionários Novos",
  "points": 0,
  "wins": 0,
  "memberCount": 0
}
```

### 6. Crie o primeiro admin

1. Cadastre-se normalmente no app
2. No Firestore Console, vá em `users/{seu-uid}`
3. Mude o campo `role` de `"user"` para `"admin"`

### 7. Execute em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## Estrutura do Projeto

```
boardcomp/
├── app/
│   ├── (auth)/          # Login e Registro
│   ├── (app)/           # Páginas autenticadas
│   │   ├── dashboard/   # Painel do usuário
│   │   ├── jogos/       # Lista e detalhes de partidas
│   │   ├── ranking/     # Rankings individual e por equipe
│   │   └── perfil/      # Perfil do usuário
│   └── (admin)/         # Área administrativa
│       └── admin/
│           ├── jogos/   # Gerenciar jogos
│           ├── partidas/# Gerenciar partidas
│           └── usuarios/# Gerenciar usuários
├── components/layout/   # Navbar
├── context/             # AuthContext
├── lib/
│   ├── firebase/        # Config, Auth, Firestore
│   ├── hooks/           # useMatches, useGames, useRanking
│   └── utils/           # Helpers
└── types/               # Tipos TypeScript
```

---

## Funcionalidades

| Funcionalidade | Status |
|---|---|
| Cadastro e login | ✅ |
| Escolha de equipe no cadastro | ✅ |
| Cadastro de jogos (admin) | ✅ |
| Criação de partidas (admin) | ✅ |
| Inscrição em partidas | ✅ |
| Ativação automática ao atingir mínimo | ✅ |
| Registro de resultados com múltiplos vencedores | ✅ |
| +1 ponto individual por vitória | ✅ |
| +1 ponto para equipe por vitória | ✅ |
| Ranking individual em tempo real | ✅ |
| Ranking por equipe em tempo real | ✅ |
| Painel com jogos aguardando/em andamento/finalizados | ✅ |
| Gerenciamento de usuários (admin) | ✅ |
| Promoção de usuários a admin | ✅ |

---

## Regras de Negócio

- Um jogo inicia automaticamente quando atinge o **mínimo de jogadores**
- Cada vencedor recebe **+1 ponto individual** e **+1 ponto para sua equipe**
- Pode haver **múltiplos vencedores** por partida
- Apenas **admins** podem cadastrar jogos, criar partidas e registrar resultados
- Usuários só podem sair de partidas com status **"aguardando"**
"# boardcomp" 
