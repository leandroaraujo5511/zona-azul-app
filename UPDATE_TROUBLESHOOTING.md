# 🔧 Solução: Update não aparece no app

## ⚠️ Problema Comum

**"Publico update mas não aparece no dispositivo"**

Isso acontece quando o **canal do build** não corresponde ao **canal do update**.

## ✅ Solução

### Situação 1: Build foi feito com profile "preview"

Se você fez o build com:
```bash
npm run build:android  # Usa profile "preview"
```

Então você precisa publicar update no canal **preview**:
```bash
npm run update:preview "Descrição da atualização"
```

### Situação 2: Build foi feito com profile "production"

Se você fez o build com:
```bash
npm run build:android:aab  # Usa profile "production"
```

Então você precisa publicar update no canal **production**:
```bash
npm run update "Descrição da atualização"
```

## 🔍 Como Verificar

### 1. Verificar qual build você instalou

Verifique no dashboard do Expo (https://expo.dev):
- Qual profile foi usado no último build
- Qual canal está configurado

### 2. Verificar no app (com logs)

O app agora tem logs de debug. Conecte o dispositivo e veja os logs:

```bash
# Android
adb logcat | grep "Updates"

# Ou use React Native Debugger
```

Você verá algo como:
```
[Updates] Channel: preview
[Updates] Runtime version: 1.0.0
[Updates] Checking for updates...
[Updates] Update available: true/false
```

### 3. Verificar updates publicados

```bash
# Listar todos os updates
eas update:list

# Ver updates de um canal específico
eas update:list --channel preview
eas update:list --channel production
```

## 📝 Exemplo Completo

### Cenário: Build Preview (para testes)

1. **Fazer build de preview:**
   ```bash
   npm run build:android
   ```

2. **Instalar APK no dispositivo**

3. **Publicar update de preview:**
   ```bash
   npm run update:preview "Correção de bugs"
   ```

4. **Abrir o app** - O update será baixado automaticamente

5. **Testar** - Verificar se funciona

6. **Se estiver ok, publicar em produção:**
   ```bash
   npm run update "Correção aprovada"
   ```
   
   ⚠️ **Mas atenção:** Para que usuários com build de produção recebam este update, você precisa:
   - Fazer um novo build de produção, OU
   - Certificar-se de que todos os builds de produção podem receber o mesmo update

### Cenário: Build Production (para usuários finais)

1. **Fazer build de produção:**
   ```bash
   npm run build:android:aab
   ```

2. **Instalar APK/AAB no dispositivo**

3. **Publicar update de produção:**
   ```bash
   npm run update "Nova funcionalidade"
   ```

4. **Abrir o app** - O update será baixado automaticamente

## 🎯 Recomendação

Para facilitar, recomendamos:

1. **Desenvolvimento/Testes:**
   - Use sempre `preview`
   - Build: `npm run build:android`
   - Update: `npm run update:preview "Teste"`

2. **Produção:**
   - Use sempre `production`
   - Build: `npm run build:android:aab`
   - Update: `npm run update "Release"`

## 🔄 Verificar Canal no App

O código do app foi atualizado com logs de debug. Para ver qual canal o app está usando:

1. Conecte o dispositivo via USB
2. Execute: `adb logcat | grep Updates`
3. Abra o app
4. Procure por: `[Updates] Channel: preview` ou `[Updates] Channel: production`

## ⚠️ Importante

- **Canal do build = Canal do update** (devem ser iguais)
- Build preview só recebe updates do canal preview
- Build production só recebe updates do canal production
- O `runtimeVersion` também deve corresponder

## 🆘 Ainda não funciona?

1. **Verifique os logs do app** (veja acima)
2. **Confirme que não está em modo dev** (`__DEV__` = false)
3. **Verifique se updates estão habilitados** (`Updates.isEnabled`)
4. **Veja os updates publicados:** `eas update:list`
5. **Force verificação:** Feche e abra o app novamente




