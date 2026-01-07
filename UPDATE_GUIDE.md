# 📲 Guia de Atualizações Automáticas (Expo Updates)

Este guia explica como usar o sistema de atualizações automáticas (OTA - Over The Air) do Expo para atualizar o app sem precisar recompilar o APK.

## 🎯 O que são Updates OTA?

Atualizações OTA permitem atualizar o código JavaScript, assets (imagens, fontes) e configurações do app sem precisar:
- Recompilar o APK/AAB
- Reenviar para a Play Store
- Usuários não precisam reinstalar o app

**Limitações:**
- Não pode atualizar código nativo (dependências nativas, plugins)
- Não pode mudar configurações do `app.json` que requerem rebuild
- Não pode mudar permissões nativas

## 🚀 Publicar uma Atualização

### Para Produção

```bash
npm run update "Sua mensagem descrevendo a atualização"
```

Exemplo:
```bash
npm run update "Correção de bugs no cadastro e melhorias na tela de estacionamento"
```

### Para Preview/Testes

```bash
npm run update:preview "Mensagem da atualização"
```

## 📝 Processo Completo

### 1. Fazer alterações no código
Faça suas alterações normalmente no código JavaScript/TypeScript, telas, componentes, etc.

### 2. Publicar a atualização

```bash
# Produção
eas update --branch production --message "Descrição da atualização"

# Preview (para testes)
eas update --branch preview --message "Descrição da atualização"
```

Ou usando os scripts npm:
```bash
npm run update "Descrição da atualização"
npm run update:preview "Descrição da atualização"
```

### 3. Verificar publicação
Acesse https://expo.dev e vá para o seu projeto para ver as atualizações publicadas.

## 🔄 Como Funciona no App

O app está configurado para:
1. **Verificar atualizações automaticamente** quando o app é aberto (`ON_LOAD`)
2. **Baixar atualizações em background** quando disponíveis
3. **Aplicar atualizações** na próxima vez que o app for aberto

### Comportamento
- **Em desenvolvimento (`__DEV__`)**: Updates são desabilitados (usa Expo Go)
- **Em produção**: Verifica e aplica updates automaticamente

## 🛠️ Configurações

### app.json
```json
{
  "updates": {
    "url": "https://u.expo.dev/SEU_PROJECT_ID",
    "fallbackToCacheTimeout": 0,
    "checkAutomatically": "ON_LOAD",
    "enabled": true
  }
}
```

### eas.json
```json
{
  "update": {
    "production": {
      "channel": "production"
    },
    "preview": {
      "channel": "preview"
    }
  }
}
```

## 📊 Branch Strategy

- **Production**: Para atualizações que vão para todos os usuários
- **Preview**: Para testar atualizações antes de enviar para produção

### Publicar em Preview primeiro
```bash
eas update --branch preview --message "Teste de nova funcionalidade"
```

Teste o app, e se estiver tudo ok:
```bash
eas update --branch production --message "Nova funcionalidade aprovada"
```

## ⚠️ Quando Precisa Recompilar (Novo Build)

Você precisa fazer um novo build APK/AAB quando:

1. **Adicionar/remover dependências nativas**
   - Qualquer pacote que use código nativo
   - Exemplos: `react-native-camera`, `react-native-sensors`, etc.

2. **Mudanças no `app.json` que requerem rebuild:**
   - `package` (Android) / `bundleIdentifier` (iOS)
   - `versionCode` (Android)
   - `version` (quando muda major.minor)
   - Adicionar novos `plugins` nativos
   - Mudanças em `android.permissions`

3. **Atualizar Expo SDK**
   - Quando atualiza a versão do Expo

### Como saber se precisa rebuild?
Se ao tentar publicar update você receber erro indicando que mudanças nativas foram detectadas, você precisa fazer um novo build.

## 🔍 Verificar Atualizações Publicadas

### Via Expo Dashboard
1. Acesse https://expo.dev
2. Vá para seu projeto
3. Aba "Updates" mostra todas as atualizações publicadas

### Via CLI
```bash
eas update:list
```

## 🧪 Testar Atualizações

### 1. Publicar em Preview
```bash
eas update --branch preview --message "Teste"
```

### 2. Instalar build de preview no dispositivo
O build precisa ter sido feito com o branch `preview`.

### 3. Verificar aplicação
- Abra o app
- O update será baixado e aplicado automaticamente
- Verifique se as mudanças apareceram

### 4. Publicar em produção
Se tudo estiver ok, publique em produção:
```bash
eas update --branch production --message "Atualização aprovada"
```

## 📱 Comportamento no App

### Primeira vez
- App verifica updates ao carregar
- Se houver update, baixa em background
- Aplica na próxima abertura

### Próximas vezes
- App verifica updates periodicamente
- Updates são aplicados silenciosamente
- Usuário não percebe interrupção

## 🔧 Troubleshooting

### Update não está sendo aplicado

1. **Verifique se o build foi feito com updates habilitado**
   ```bash
   eas build --platform android --profile preview
   ```

2. **Verifique se está no modo correto**
   - Updates só funcionam em builds de produção/preview
   - Não funcionam em `__DEV__` mode

3. **Force verificação manual**
   ```javascript
   await Updates.checkForUpdateAsync();
   await Updates.fetchUpdateAsync();
   await Updates.reloadAsync();
   ```

### Erro ao publicar update

Se receber erro sobre mudanças nativas:
- Faça um novo build
- Publique o build
- Depois publique updates normalmente

## 📚 Recursos

- [Documentação Oficial Expo Updates](https://docs.expo.dev/versions/latest/sdk/updates/)
- [EAS Update CLI](https://docs.expo.dev/eas-update/introduction/)
- [EAS Update Dashboard](https://expo.dev)

## 🎯 Workflow Recomendado

1. **Desenvolver** → Fazer alterações no código
2. **Publicar Preview** → `npm run update:preview "Teste"`
3. **Testar** → Verificar se funciona corretamente
4. **Publicar Produção** → `npm run update "Descrição"`
5. **Monitorar** → Verificar se updates estão sendo aplicados

Para mudanças nativas:
1. **Fazer novo build** → `npm run build:android`
2. **Publicar build** → Instalar novo APK/AAB
3. **Depois publicar updates normalmente**


