# Documentação de Implantação - Jana Beleza e Estética

## Visão Geral

Este documento descreve o processo de implantação do aplicativo interno da clínica Jana Beleza e Estética, incluindo requisitos, etapas de instalação, configuração e procedimentos de validação.

## Requisitos de Sistema

### Servidor
- Sistema Operacional: Ubuntu 20.04 LTS ou superior
- CPU: 4 núcleos ou superior
- Memória RAM: 8GB mínimo, 16GB recomendado
- Armazenamento: 50GB SSD mínimo
- Banco de Dados: PostgreSQL 13 ou superior

### Clientes (Estações de Trabalho)
- Navegadores suportados: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- Resolução de tela mínima: 1366x768
- Conexão de internet estável: 10Mbps mínimo

### Dispositivos Móveis (Tablets)
- iOS 14+ ou Android 10+
- Tela de 10" ou superior recomendada para melhor experiência

## Arquitetura da Solução

O aplicativo segue uma arquitetura cliente-servidor:

1. **Frontend**: Aplicação React com TypeScript
2. **Backend**: API RESTful em Python com Flask
3. **Banco de Dados**: PostgreSQL
4. **Armazenamento de Imagens**: Sistema de arquivos com backup em nuvem
5. **Autenticação**: JWT (JSON Web Tokens)

## Procedimento de Implantação

### 1. Preparação do Ambiente

```bash
# Atualizar o sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install -y postgresql postgresql-contrib nginx python3 python3-pip python3-venv nodejs npm

# Configurar PostgreSQL
sudo -u postgres createuser --interactive
sudo -u postgres createdb jana_beleza_db
```

### 2. Configuração do Backend

```bash
# Clonar o repositório
git clone https://github.com/jana-beleza/app-backend.git
cd app-backend

# Criar e ativar ambiente virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com as configurações apropriadas

# Executar migrações do banco de dados
flask db upgrade

# Carregar dados iniciais
flask seed-db

# Configurar o serviço
sudo cp deployment/jana-backend.service /etc/systemd/system/
sudo systemctl enable jana-backend
sudo systemctl start jana-backend
```

### 3. Configuração do Frontend

```bash
# Clonar o repositório
git clone https://github.com/jana-beleza/app-frontend.git
cd app-frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com as configurações apropriadas

# Construir a aplicação
npm run build

# Configurar Nginx
sudo cp deployment/jana-frontend.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/jana-frontend.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Configuração de SSL

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d app.janaestética.com.br

# Verificar renovação automática
sudo certbot renew --dry-run
```

## Procedimento de Validação

Após a implantação, execute os seguintes testes para validar a instalação:

1. **Teste de Acesso**:
   - Acesse a URL da aplicação (https://app.janaestética.com.br)
   - Verifique se a página de login é exibida corretamente

2. **Teste de Autenticação**:
   - Faça login com as credenciais de administrador
   - Verifique se o redirecionamento para o dashboard ocorre corretamente

3. **Teste de Funcionalidades Críticas**:
   - Verifique o acesso ao módulo de Vendas
   - Verifique o acesso ao módulo de Prontuário
   - Verifique o acesso ao módulo de Agendamento
   - Verifique o acesso ao módulo de Estoque

4. **Teste de Permissões**:
   - Faça login com diferentes perfis de usuário
   - Verifique se as permissões estão sendo aplicadas corretamente

## Procedimento de Backup

### Backup do Banco de Dados

```bash
# Backup diário automatizado
sudo cp deployment/jana-db-backup.sh /etc/cron.daily/
sudo chmod +x /etc/cron.daily/jana-db-backup.sh

# Backup manual
pg_dump -U postgres jana_beleza_db > jana_beleza_$(date +%Y%m%d).sql
```

### Backup de Imagens e Arquivos

```bash
# Backup diário automatizado
sudo cp deployment/jana-files-backup.sh /etc/cron.daily/
sudo chmod +x /etc/cron.daily/jana-files-backup.sh
```

## Procedimento de Recuperação

### Recuperação do Banco de Dados

```bash
# Restaurar a partir de um backup
psql -U postgres jana_beleza_db < backup_file.sql
```

### Recuperação de Imagens e Arquivos

```bash
# Restaurar a partir de um backup
tar -xzf jana_files_backup.tar.gz -C /var/www/jana-beleza/uploads/
```

## Contatos de Suporte

- **Suporte Técnico**: suporte@janaestética.com.br
- **Emergências**: (XX) XXXX-XXXX

## Registro de Alterações

| Data | Versão | Descrição | Autor |
|------|--------|-----------|-------|
| 08/06/2025 | 1.0 | Versão inicial | Equipe de Desenvolvimento |
