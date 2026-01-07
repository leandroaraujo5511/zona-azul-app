# 📱 Como Criar APK para Testes

Este guia mostra como gerar um APK para testar o app em dispositivos Android físicos.

## 📋 Pré-requisitos

1. **Node.js** instalado (versão 18+)
2. **Expo CLI** instalado globalmente:
   ```bash
   npm install -g expo-cli eas-cli
   ```
3. **Conta Expo** (gratuita) - crie em https://expo.dev

## 🚀 Opção 1: Build Local (APK rápido para testes)

### Passo 1: Instalar EAS CLI
```bash
npm install -g eas-cli
```

### Passo 2: Fazer login no Expo
```bash
eas login
```

### Passo 3: Configurar o projeto (apenas primeira vez)
```bash
cd appZonaAzul
eas build:configure
```

### Passo 4: Gerar APK local
```bash
npm run build:android:apk
```

**Nota:** O build local requer Android SDK instalado. Se não tiver, use a Opção 2.

## 🌐 Opção 2: Build na Nuvem (Recomendado - Mais fácil)

### Passo 1: Instalar EAS CLI e fazer login
```bash
npm install -g eas-cli
eas login
```

### Passo 2: Configurar o projeto (apenas primeira vez)
```bash
cd appZonaAzul
eas build:configure
```

### Passo 3: Gerar APK na nuvem
```bash
npm run build:android
```

Este comando vai:
- Fazer upload do código para o servidor Expo
- Compilar o APK na nuvem
- Fornecer um link para download do APK

### Passo 4: Baixar o APK
1. Aguarde o build terminar (pode levar 10-20 minutos)
2. Acesse o link fornecido ou vá em https://expo.dev
3. Baixe o APK gerado
4. Transfira para seu dispositivo Android

### Passo 5: Instalar no dispositivo
1. No dispositivo Android, vá em **Configurações > Segurança**
2. Ative **Fontes Desconhecidas** ou **Instalar apps desconhecidos**
3. Abra o arquivo APK baixado
4. Siga as instruções para instalar

## 🔧 Configurações Importantes

### Package Name
O package name configurado é: `com.picosparking.app`

Se precisar alterar, edite `app.json`:
```json
"android": {
  "package": "com.picosparking.app"
}
```

### Version Code
A versão atual é `1`. A cada novo APK, incremente:
```json
"android": {
  "versionCode": 2  // Incrementar para cada nova versão
}
```

## 📦 Comandos Disponíveis

```bash
# Build APK na nuvem (recomendado)
npm run build:android

# Build APK local (requer Android SDK)
npm run build:android:apk

# Build AAB para Google Play Store
npm run build:android:aab
```

## ⚠️ Notas Importantes

1. **Primeiro build pode demorar mais** - O Expo precisa baixar dependências e configurar o ambiente
2. **Limite gratuito** - Conta gratuita tem limite de builds por mês
3. **API Base URL** - Certifique-se de que `EXPO_PUBLIC_API_BASE_URL` no `.env` aponte para um servidor acessível do dispositivo
4. **Permissões** - O app precisa de permissão de Internet (já configurado)

## 🐛 Troubleshooting

### Erro: "EAS not configured"
```bash
eas build:configure
```

### Erro: "Not logged in"
```bash
eas login
```

### Erro: "Invalid package name"
Verifique se o package name no `app.json` está correto e no formato `com.nome.app`

### APK não instala no dispositivo
- Verifique se ativou "Fontes desconhecidas" nas configurações
- Alguns dispositivos precisam autorizar o navegador ou gerenciador de arquivos

## 📝 Próximos Passos

Após testar o APK:
1. Ajustar configurações se necessário
2. Incrementar `versionCode` para próximas versões
3. Quando estiver pronto, use `build:android:aab` para criar o AAB para a Play Store


