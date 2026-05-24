# AI 商家服务平台 - 服务器部署文档

📦 完整的服务器部署方案，包括传统部署和 Docker 部署两种方式。

---

## 📋 目录

- [快速开始](#快速开始)
- [部署方式](#部署方式)
  - [传统部署](#传统部署)
  - [Docker 部署](#docker-部署)
- [配置文件](#配置文件)
- [脚本说明](#脚本说明)
- [维护指南](#维护指南)

---

## 🚀 快速开始

### 前置要求

- 服务器：Ubuntu 20.04+ / CentOS 7+
- Node.js 20+
- MySQL 8.0+
- Nginx 1.18+
- PM2 (可选，用于进程管理)
- Docker & Docker Compose (可选，用于容器化部署)

### 快速部署步骤

```bash
# 1. 上传项目文件到服务器
# 2. 进入项目目录
cd /path/to/project

# 3. 复制部署文件
cp -r deploy/* /tmp/

# 4. 根据部署方式选择后续步骤
```

---

## 🛠️ 部署方式

### 传统部署

推荐用于生产环境的标准部署方式。

#### 详细步骤

1. **环境准备**
   ```bash
   # 更新系统
   sudo apt update && sudo apt upgrade -y
   
   # 安装 Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # 安装 Nginx
   sudo apt install -y nginx
   
   # 安装 MySQL
   sudo apt install -y mysql-server
   
   # 安装 PM2
   sudo npm install -g pm2
   ```

2. **数据库配置**
   ```bash
   # 创建数据库和用户
   sudo mysql -u root -p
   ```
   
   执行 SQL：
   ```sql
   CREATE DATABASE ai_business_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'ai_platform_user'@'localhost' IDENTIFIED BY 'your_secure_password';
   GRANT ALL PRIVILEGES ON ai_business_platform.* TO 'ai_platform_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **配置环境变量**
   ```bash
   # 复制配置模板
   cp deploy/config/.env.production.example backend/.env
   
   # 编辑配置
   vim backend/.env
   ```

4. **运行部署脚本**
   ```bash
   # 给脚本添加执行权限
   chmod +x deploy/scripts/deploy.sh
   
   # 运行部署脚本
   ./deploy/scripts/deploy.sh
   ```

5. **配置 Nginx**
   ```bash
   # 复制配置文件
   sudo cp deploy/nginx/ai-business-platform.conf /etc/nginx/sites-available/
   
   # 修改配置中的域名
   sudo vim /etc/nginx/sites-available/ai-business-platform.conf
   
   # 启用配置
   sudo ln -s /etc/nginx/sites-available/ai-business-platform.conf /etc/nginx/sites-enabled/
   
   # 测试并重启 Nginx
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **配置 HTTPS**
   ```bash
   # 安装 Certbot
   sudo apt install -y certbot python3-certbot-nginx
   
   # 获取并配置证书
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

---

### Docker 部署

快速、一致的部署方式，推荐用于快速搭建或开发环境。

#### 详细步骤

1. **安装 Docker**
   ```bash
   # 安装 Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # 安装 Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   
   # 启动 Docker
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

2. **配置环境变量**
   ```bash
   # 复制配置模板
   cp deploy/config/.env.docker.example deploy/.env
   
   # 编辑配置
   vim deploy/.env
   ```

3. **启动服务**
   ```bash
   # 进入 Docker 目录
   cd deploy/docker
   
   # 构建并启动所有服务
   docker-compose up -d --build
   
   # 查看服务状态
   docker-compose ps
   
   # 查看日志
   docker-compose logs -f
   ```

4. **初始化数据库**
   ```bash
   # 进入后端容器
   docker-compose exec backend bash
   
   # 运行数据库迁移
   npx prisma db push
   
   # 创建测试用户 (可选)
   npm run seed:test
   ```

---

## 📁 配置文件说明

### 配置文件结构

```
deploy/
├── config/
│   ├── .env.production.example      # 传统部署环境变量模板
│   └── .env.docker.example         # Docker 部署环境变量模板
├── nginx/
│   └── ai-business-platform.conf   # Nginx 配置文件
├── docker/
│   ├── docker-compose.yml          # Docker Compose 配置
│   ├── Dockerfile.backend         # 后端 Dockerfile
│   └── Dockerfile.frontend        # 前端 Dockerfile
└── scripts/
    ├── deploy.sh                  # 自动部署脚本
    └── backup.sh                  # 数据库备份脚本
```

### 关键配置项

#### 环境变量 (.env)

| 配置项 | 说明 | 示例 |
|--------|------|------|
| NODE_ENV | 运行环境 | production |
| PORT | 后端端口 | 3000 |
| DATABASE_URL | 数据库连接字符串 | mysql://user:pass@localhost/db |
| JWT_SECRET | JWT 密钥 | (随机字符串) |
| COS_SECRET_ID | 腾讯云 COS ID | - |
| COS_SECRET_KEY | 腾讯云 COS Key | - |

#### Nginx 配置

需要修改以下内容：
- `server_name`：替换为您的域名
- `ssl_certificate`：SSL 证书路径
- `ssl_certificate_key`：SSL 私钥路径

---

## 📜 脚本说明

### deploy.sh - 自动部署脚本

一键部署脚本，包含以下功能：

- ✅ 环境检查
- ✅ 目录创建
- ✅ 版本备份
- ✅ 后端部署
- ✅ 前端部署
- ✅ 服务启动
- ✅ 测试用户创建

**使用方法：**
```bash
chmod +x deploy/scripts/deploy.sh
./deploy/scripts/deploy.sh
```

### backup.sh - 数据库备份脚本

自动备份脚本，包含以下功能：

- ✅ 数据库备份
- ✅ 文件备份 (可选)
- ✅ 旧备份清理
- ✅ 备份列表查看

**使用方法：**
```bash
chmod +x deploy/scripts/backup.sh

# 完整备份
./deploy/scripts/backup.sh

# 仅列出备份
./deploy/scripts/backup.sh --list

# 仅清理旧备份
./deploy/scripts/backup.sh --cleanup
```

**定时备份配置：**
```bash
# 编辑 crontab
crontab -e

# 添加每天凌晨 2 点备份
0 2 * * * /var/www/ai-business-platform/scripts/backup.sh
```

---

## 🔧 维护指南

### 日常维护

1. **查看服务状态**
   ```bash
   # PM2 服务
   pm2 status
   pm2 logs ai-backend
   
   # Docker 服务
   cd deploy/docker
   docker-compose ps
   docker-compose logs
   ```

2. **更新应用**
   ```bash
   # 备份当前版本
   ./deploy/scripts/deploy.sh  # 会自动备份
   
   # 或手动备份
   cp -r /var/www/ai-business-platform /var/backups/ai-business-platform_$(date +%Y%m%d)
   ```

3. **清理日志**
   ```bash
   # 清理 Nginx 日志 (保留 30 天)
   sudo find /var/log/nginx -name "*.log" -mtime +30 -delete
   ```

### 故障排查

#### 后端无法启动

```bash
# 查看 PM2 日志
pm2 logs ai-backend --err

# 检查端口占用
netstat -tlnp | grep 3000

# 检查数据库连接
mysql -u ai_platform_user -p -h localhost ai_business_platform
```

#### 前端无法访问

```bash
# 检查 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 检查文件权限
ls -la /var/www/ai-business-platform/frontend/dist
```

#### 数据库问题

```bash
# 检查 MySQL 状态
sudo systemctl status mysql

# 检查慢查询日志
sudo tail -f /var/log/mysql/slow.log

# 从备份恢复
gzip -d db_backup_20240101_000000.sql.gz
mysql -u ai_platform_user -p ai_business_platform < db_backup_20240101_000000.sql
```

### 性能优化

1. **MySQL 优化**
   - 配置适当的缓冲区大小
   - 开启慢查询日志
   - 定期执行 OPTIMIZE TABLE

2. **Nginx 优化**
   - 启用 gzip 压缩
   - 配置缓存策略
   - 调整 worker 进程数

3. **应用优化**
   - 启用 Redis 缓存
   - 配置 CDN
   - 使用 PM2 集群模式

---

## 🔒 安全建议

1. **防火墙配置**
   ```bash
   # Ubuntu UFW
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

2. **SSH 安全**
   - 禁用 root 登录
   - 使用密钥认证
   - 修改默认端口

3. **文件权限**
   ```bash
   # 设置合理的权限
   sudo chown -R www-data:www-data /var/www/ai-business-platform
   sudo chmod -R 755 /var/www/ai-business-platform
   sudo chmod -R 644 /var/www/ai-business-platform/backend/.env
   ```

4. **定期更新**
   - 系统安全更新
   - 依赖包安全更新
   - TLS 证书续期

---

## 📞 技术支持

如遇到问题，请检查：

1. 日志文件：
   - 后端：`/var/www/ai-business-platform/backend/logs/`
   - Nginx：`/var/log/nginx/`
   - PM2：`pm2 logs ai-backend`

2. 环境配置：确认 `.env` 文件配置正确

3. 网络连接：检查数据库、API 连接

---

## 📄 相关文档

- [主项目 README](../README.md)
- [快速启动指南](../QUICK_START.md)
- [完整部署文档](../DEPLOYMENT.md)

---

**祝您部署顺利！🎉**
