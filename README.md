# Assistencialize

Aplicativo desktop para gerenciar múltiplas instâncias do WhatsApp Web simultaneamente.

## 🚀 Recursos

- ✅ **Múltiplas Instâncias**: Gerencie várias contas do WhatsApp ao mesmo tempo
- ✅ **Autenticação Segura**: Login via Supabase com suporte a Google OAuth
- ✅ **Planos de Assinatura**: Sistema de limites baseado em planos
- ✅ **Auto-Update**: Atualizações automáticas via GitHub Releases
- ✅ **Persistência de Sessão**: Suas sessões do WhatsApp são mantidas entre reinicializações
- ✅ **Interface Moderna**: Design escuro e intuitivo

## 📦 Download

Baixe a versão mais recente em [Releases](https://github.com/SeveroAllan/assistencialize-app/releases)

## 🛠️ Desenvolvimento

### Pré-requisitos

- Node.js 16 ou superior
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/SeveroAllan/assistencialize-app.git

# Entre na pasta
cd assistencialize-app

# Instale as dependências
npm install

# Execute em modo de desenvolvimento
npm start
```

### Build

```bash
# Criar instalador para Windows
npm run build
```

## 🔧 Configuração

### Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Configure as credenciais em `src/config/supabase.js`
3. Execute os scripts SQL da pasta `database/`

### Auto-Update

Para habilitar auto-update:

1. Configure o token do GitHub: `setx GH_TOKEN "seu_token"`
2. Faça build e publique: `npm run build -- --publish always`

Veja o [Guia de Auto-Update](GUIA_AUTO_UPDATE.md) para mais detalhes.

## 📝 Estrutura do Projeto

```
assistencialize-app/
├── src/
│   ├── config/          # Configurações (Supabase)
│   └── features/        # Módulos por funcionalidade
│       ├── auth/        # Autenticação
│       ├── instances/   # Gerenciamento de instâncias
│       ├── subscription/# Sistema de assinaturas
│       └── updater/     # Auto-update
├── database/            # Scripts SQL
├── main.js             # Processo principal do Electron
├── renderer.js         # Processo de renderização
├── index.html          # Interface principal
└── styles.css          # Estilos globais
```

## 🗄️ Banco de Dados

O aplicativo usa Supabase com as seguintes tabelas:

- `plans` - Planos de assinatura
- `user_subscriptions` - Assinaturas dos usuários
- `whatsapp_instances` - Instâncias do WhatsApp

## 📄 Licença

Este projeto é privado e proprietário.

## 👤 Autor

**Allan Severo**

- GitHub: [@SeveroAllan](https://github.com/SeveroAllan)

## 🤝 Suporte

Para suporte, abra uma [issue](https://github.com/SeveroAllan/assistencialize-app/issues) no GitHub.
