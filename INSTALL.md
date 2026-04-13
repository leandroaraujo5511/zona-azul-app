# Instruções de Instalação - Sprint 3.1

## Passo a Passo

### 1. Instalar Dependências

Execute no terminal dentro da pasta `appZonaAzul`:

```bash
npm install
```

Isso instalará todas as dependências necessárias, incluindo:
- `@react-native-async-storage/async-storage`
- `@react-navigation/native-stack`
- `@tanstack/react-query`
- `axios`

### 2. Configurar URL da API

Abra o arquivo `src/constants/config.ts` e ajuste a URL da API:

**Para desenvolvimento local:**
- No Windows: Use `ipconfig` no terminal para descobrir seu IP
- No Mac/Linux: Use `ifconfig` no terminal
- Substitua `localhost` pelo seu IP local (ex: `http://192.168.1.100:3000/api/v1`)

**Importante:** Use o IP da sua máquina, não `localhost`, pois dispositivos/emuladores precisam acessar a API pela rede.

### 3. Verificar Backend

Certifique-se de que o backend está rodando na porta 3000 (ou ajuste a URL configurada).

### 4. Iniciar o App

```bash
# Iniciar o servidor de desenvolvimento
npm start

# Ou para plataformas específicas:
npm run ios      # iOS
npm run android  # Android
npm run web      # Web
```

## Estrutura Criada

✅ **Constantes** (`src/constants/config.ts`)
- Configuração da API base URL
- Chaves de armazenamento

✅ **Tipos** (`src/types/api.ts`)
- Types TypeScript para toda a API
- User, LoginRequest, RegisterRequest, etc.

✅ **Serviços**
- `src/services/api.ts` - Cliente Axios com interceptors
- `src/services/auth.service.ts` - Serviço de autenticação

✅ **Contexto** (`src/contexts/AuthContext.tsx`)
- Gerenciamento de estado de autenticação
- Funções de login, registro e logout
- Persistência de sessão

✅ **Navegação** (`src/navigation/AppNavigator.tsx`)
- Configuração do React Navigation
- Rotas de autenticação

✅ **Telas**
- `src/screens/LoginScreen.tsx` - Tela de login
- `src/screens/RegisterScreen.tsx` - Tela de registro
- `src/screens/HomeScreen.tsx` - Tela inicial (home)

✅ **App.tsx** - Componente raiz com providers

## Testando

1. Inicie o app
2. Teste o registro de um novo usuário
3. Teste o login
4. Verifique se a sessão persiste após fechar e reabrir o app

## Troubleshooting

### Erro de conexão com a API
- Verifique se o backend está rodando
- Verifique se a URL da API está correta (use IP, não localhost)
- Verifique se não há firewall bloqueando a conexão

### Erros de tipo TypeScript
- Execute `npm install` novamente
- Verifique se todas as dependências foram instaladas corretamente

### Problemas com AsyncStorage
- Certifique-se de que `@react-native-async-storage/async-storage` foi instalado
- No iOS, pode ser necessário executar `pod install` na pasta `ios/`







