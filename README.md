# Zona Azul - App Mobile

Aplicativo mobile para gestão de estacionamento rotativo (Zona Azul).

## 🚀 Configuração

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Expo CLI
- Backend rodando (veja `/backend`)

### Instalação

1. Instale as dependências:

```bash
npm install
```

2. Configure a URL da API no arquivo `src/constants/config.ts`:

```typescript
export const API_BASE_URL = __DEV__
  ? 'http://SEU_IP_LOCAL:3000/api/v1'  // Para desenvolvimento (substitua SEU_IP_LOCAL pelo seu IP)
  : 'https://api.zonazul.com/api/v1';  // Para produção
```

**Importante**: Para desenvolvimento, você precisará usar o IP da sua máquina local, não `localhost`, pois o dispositivo/emulador precisa acessar a API.

3. Inicie o servidor de desenvolvimento:

```bash
npm start
```

Ou para plataformas específicas:

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 📁 Estrutura do Projeto

```
appZonaAzul/
├── src/
│   ├── constants/          # Constantes e configurações
│   │   └── config.ts       # Configurações da API
│   ├── contexts/           # React Contexts
│   │   └── AuthContext.tsx # Contexto de autenticação
│   ├── navigation/         # Configuração de navegação
│   │   └── AppNavigator.tsx
│   ├── screens/            # Telas da aplicação
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   └── HomeScreen.tsx
│   ├── services/           # Serviços de API
│   │   ├── api.ts          # Cliente Axios configurado
│   │   └── auth.service.ts # Serviço de autenticação
│   └── types/              # Tipos TypeScript
│       └── api.ts          # Tipos da API
├── App.tsx                 # Componente raiz
└── package.json
```

## 🔐 Autenticação

O app utiliza:
- JWT tokens (access token + refresh token)
- AsyncStorage para persistência de tokens
- Interceptors do Axios para adicionar tokens automaticamente
- Refresh token automático quando o access token expira

## 🛠️ Tecnologias

- **React Native** com **Expo**
- **TypeScript**
- **React Navigation** - Navegação entre telas
- **React Query** - Gerenciamento de estado servidor
- **Axios** - Cliente HTTP
- **AsyncStorage** - Armazenamento local

## 📱 Funcionalidades Implementadas (Sprint 3.1)

- ✅ Tela de Login
- ✅ Tela de Registro
- ✅ Tela Home (básica)
- ✅ Autenticação completa (login, registro, logout)
- ✅ Persistência de sessão
- ✅ Refresh token automático

## 🔄 Próximas Sprints

- Sprint 3.2: Gerenciamento de Veículos
- Sprint 3.3: Sistema de Créditos
- Sprint 3.4: Estacionamentos - Parte 1
- Sprint 3.5: Estacionamentos - Parte 2
- Sprint 3.6: Notificações e Polimento

## 📝 Notas

- O projeto está configurado para usar React Navigation Stack, não Expo Router (que vem por padrão)
- Certifique-se de que o backend está rodando antes de iniciar o app
- Para desenvolvimento, ajuste a URL da API no arquivo de configuração
