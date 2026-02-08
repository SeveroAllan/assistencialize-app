# Guia de Auto-Update do Assistencialize

Este aplicativo possui sistema de atualização automática via GitHub Releases.

## Como Funciona

1. **Verificação Automática**: O app verifica atualizações ao iniciar
2. **Download Automático**: Se houver atualização, baixa automaticamente em segundo plano
3. **Notificação ao Usuário**: Mostra notificação quando a atualização estiver pronta
4. **Instalação**: Usuário clica para reiniciar e instalar

## Configuração Inicial

### 1. Criar Repositório no GitHub

1. Acesse https://github.com e crie um novo repositório
2. Nome sugerido: `assistencialize-app`
3. Pode ser público ou privado

### 2. Atualizar package.json

Edite o arquivo `package.json` e substitua `SEU_USUARIO_GITHUB` pelo seu usuário do GitHub:

```json
"publish": [
  {
    "provider": "github",
    "owner": "SEU_USUARIO_GITHUB",  // ← Coloque seu usuário aqui
    "repo": "assistencialize-app",
    "private": false
  }
],
"repository": {
  "type": "git",
  "url": "https://github.com/SEU_USUARIO_GITHUB/assistencialize-app.git"  // ← E aqui
}
```

### 3. Gerar Token do GitHub

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Marque a permissão: `repo` (Full control of private repositories)
4. Copie o token gerado

### 4. Configurar Token no Sistema

**Windows:**
```powershell
setx GH_TOKEN "seu_token_aqui"
```

**Mac/Linux:**
```bash
export GH_TOKEN="seu_token_aqui"
```

## Como Publicar Atualizações

### 1. Atualizar a Versão

Edite `package.json` e incremente a versão:
```json
{
  "version": "1.0.2"  // Era 1.0.1, agora 1.0.2
}
```

### 2. Build e Publicar

Execute o comando:
```bash
npm run build -- --publish always
```

Isso vai:
- Compilar o aplicativo
- Criar os instaladores (Windows: .exe, Mac: .dmg, Linux: .AppImage)
- Criar uma Release no GitHub automaticamente
- Fazer upload dos arquivos

### 3. Verificar no GitHub

1. Acesse: `https://github.com/SEU_USUARIO/assistencialize-app/releases`
2. Você verá a nova versão publicada
3. Os usuários receberão a atualização automaticamente

## Fluxo de Atualização para o Usuário

1. **App abre** → Verifica atualizações
2. **Atualização encontrada** → Notificação: "Nova atualização disponível!"
3. **Download em andamento** → Mostra progresso
4. **Download completo** → Notificação: "Atualização pronta! Clique para instalar"
5. **Usuário clica** → App reinicia e instala a atualização

## Comandos Úteis

```bash
# Apenas build (sem publicar)
npm run build

# Build e publicar
npm run build -- --publish always

# Testar localmente
npm start
```

## Notas Importantes

- ✅ O app verifica atualizações a cada inicialização
- ✅ Downloads são feitos em segundo plano
- ✅ Instalação só acontece quando o usuário aceita
- ✅ Funciona em Windows, Mac e Linux
- ⚠️ Certifique-se de sempre incrementar a versão no `package.json`
- ⚠️ O token GH_TOKEN deve estar configurado para publicar

## Verificação Manual

Usuários podem verificar atualizações manualmente:
- Clique com botão direito na janela
- Selecione "Verificar Atualizações"

## Troubleshooting

**Erro ao publicar:**
- Verifique se o token GH_TOKEN está configurado
- Confirme que o repositório existe no GitHub
- Verifique se o nome do repositório está correto no package.json

**Atualização não aparece:**
- Confirme que a versão foi incrementada
- Verifique se a Release foi criada no GitHub
- Aguarde alguns minutos (pode haver cache)
