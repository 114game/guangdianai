# 服务器部署指南

本文档提供完整的 AI 商家服务平台服务器部署方案。

---

## 目录
1. [服务器环境要求](#服务器环境要求)
2. [传统部署方式](#传统部署方式)
3. [Docker部署方式](#docker部署方式)
4. [Nginx反向代理配置](#nginx反向代理配置)
5. [HTTPS配置](#https配置)
6. [数据库配置](#数据库配置)
7. [自动部署脚本](#自动部署脚本)
8. [监控与维护](#监控与维护)

---

## 服务器环境要求

### 推荐配置
- **操作系统**: Ubuntu 20.04 / 22.04 LTS 或 CentOS 7+
- **CPU**: 2核以上
- **内存**: 4GB 以上
- **磁盘**: 40GB 以上 SSD
- **Node.js**: 18.x 或 20.x
- **MySQL**: 8.0+
- **Nginx**: 1.18+
- **PM2**: 用于进程管理 (可选)

### 基础软件安装

#### Ubuntu/Debian
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y git curl wget vim nginx

# 安装 Node.js (使用 NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 PM2
sudo npm install -g pm2

# 安装 MySQL
sudo apt install -y mysql-server
```

#### CentOS/RHEL
```bash
# 安装基础工具
sudo yum install -y git curl wget vim nginx

# 安装 Node.js
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# 安装 PM2
sudo npm install -g pm2
```

---

## 传统部署方式

### 1. 服务器准备

#### 创建应用目录
```bash
# 创建应用目录
sudo mkdir -p /var/www/ai-business-platform
sudo chown -R $USER:$USER /var/www/ai-business-platform

# 进入目录
cd /var/www/ai-business-platform
```

### 2. 上传代码

#### 方式一: 使用 Git
```bash
# 克隆仓库（根据实际情况修改）
git clone <your-repository-url> .

# 或者上传本地文件
# 使用 scp: scp -r ./ user@server:/var/www/ai-business-platform
```

#### 方式二: 使用 SCP 上传
```bash
# 在本地执行
scp -r ./backend user@your-server:/var/www/ai-business-platform/
scp -r ./frontend user@your-server:/var/www/ai-business-platform/
```

### 3. 后端部署

#### 安装依赖
```bash
cd /var/www/ai-business-platform/backend
npm install --production
```

#### 配置环境变量
```bash
# 复制环境配置模板
cp .env.example .env

# 编辑配置
vim .env
```

配置内容:
```env
# 服务器配置
PORT=3000
NODE_ENV=production

# 数据库配置
DATABASE_URL="mysql://用户名:密码@localhost:3306/ai_business_platform?schema=public"

# JWT 密钥 (生产环境请使用强密码)
JWT_SECRET="your-production-jwt-secret-key-change-this"
JWT_ADMIN_SECRET="your-production-admin-jwt-secret-key-change-this"

# 腾讯云 COS 配置
COS_SECRET_ID=""
COS_SECRET_KEY=""
COS_REGION=""
COS_BUCKET=""

# 阿里云短信配置
ALIYUN_ACCESS_KEY_ID=""
ALIYUN_ACCESS_KEY_SECRET=""
ALIYUN_SIGN_NAME=""
ALIYUN_TEMPLATE_CODE=""

# 微信登录配置
WECHAT_APP_ID=""
WECHAT_APP_SECRET=""
```

#### 初始化数据库
```bash
# 生成 Prisma 客户端
npx prisma generate

# 推送数据库结构
npx prisma db push
```

#### 使用 PM2 启动后端
```bash
# 先构建项目
npm run build

# 使用 PM2 启动
pm2 start dist/index.js --name ai-backend

# 查看状态
pm2 status

# 查看日志
pm2 logs ai-backend

# 设置开机自启
pm2 startup
pm2 save
```

### 4. 前端部署

#### 安装依赖并构建
```bash
cd /var/www/ai-business-platform/frontend
npm install
npm run build
```

构建完成后会在 `dist` 目录生成静态文件。

#### 配置 Nginx
参考后面的 [Nginx反向代理配置](#nginx反向代理配置) 章节。

---

## Docker部署方式

### 1. Docker安装

#### Ubuntu/Debian
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

### 2. 创建 Docker 配置文件

我们已经为您准备好了 Docker 配置文件，包括：
- `docker-compose.yml` - 完整的服务编排
- `backend/Dockerfile` - 后端镜像
- `frontend/Dockerfile` - 前端镜像

### 3. 启动服务

```bash
# 进入项目目录
cd /var/www/ai-business-platform

# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 停止并删除数据
docker-compose down -v
```

### 4. 初始化数据

```bash
# 进入后端容器
docker-compose exec backend bash

# 初始化数据库
npx prisma db push

# 创建测试用户
npm run seed:test

# 退出容器
exit
```

---

## Nginx反向代理配置

### 1. 基础配置

创建配置文件 `/etc/nginx/sites-available/ai-business-platform`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # 修改为您的域名

    # 前端静态文件
    location / {
        root /var/www/ai-business-platform/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # 缓存配置
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 健康检查
    location /health {
        proxy_pass http://127.0.0.1:3000;
        access_log off;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # 日志配置
    access_log /var/log/nginx/ai-business-platform-access.log;
    error_log /var/log/nginx/ai-business-platform-error.log;
}
```

### 2. 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/ai-business-platform /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
# 或者
sudo service nginx restart
```

### 3. 防火墙配置

```bash
# Ubuntu (UFW)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## HTTPS配置

### 使用 Let's Encrypt 免费证书

#### 安装 Certbot
```bash
# Ubuntu/Debian
sudo apt install -y certbot python3-certbot-nginx

# CentOS
sudo yum install -y certbot python3-certbot-nginx
```

#### 获取证书
```bash
# 自动配置 Nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 按提示输入邮箱并同意服务条款
```

#### 证书自动续期
```bash
# 测试续期
sudo certbot renew --dry-run

# Certbot 会自动添加定时任务，无需手动配置
```

#### 配置后的 Nginx 文件
Certbot 会自动更新配置文件，类似:

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_session_cache shared:le_nginx_SSL:10m;
    ssl_session_timeout 1440m;
    ssl_session_tickets off;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    # 其他配置...
}

# HTTP 自动重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 数据库配置

### 1. MySQL 安全配置

```bash
# 运行安全配置脚本
sudo mysql_secure_installation

# 按提示操作：
# - 设置 root 密码
# - 删除匿名用户
# - 禁止 root 远程登录
# - 删除测试数据库
# - 重新加载权限表
```

### 2. 创建数据库和用户

```bash
# 登录 MySQL
sudo mysql -u root -p

# 执行以下 SQL
CREATE DATABASE ai_business_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ai_platform_user'@'localhost' IDENTIFIED BY 'your-strong-password';
GRANT ALL PRIVILEGES ON ai_business_platform.* TO 'ai_platform_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. 更新 .env 配置

```env
DATABASE_URL="mysql://ai_platform_user:your-strong-password@localhost:3306/ai_business_platform?schema=public"
```

### 4. 数据库备份

创建备份脚本 `/var/www/ai-business-platform/scripts/backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/ai-business-platform"
DATE=$(date +"%Y%m%d_%H%M%S")
DB_NAME="ai_business_platform"
DB_USER="ai_platform_user"
DB_PASS="your-password"

mkdir -p $BACKUP_DIR

mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# 保留最近7天的备份
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: db_backup_$DATE.sql.gz"
```

添加定时任务:
```bash
# 编辑 crontab
crontab -e

# 每天凌晨2点备份
0 2 * * * /bin/bash /var/www/ai-business-platform/scripts/backup-db.sh
```

---

## 自动部署脚本

### 1. 创建部署脚本

创建 `/var/www/ai-business-platform/scripts/deploy.sh`:

```bash
#!/bin/bash
set -e

# 配置
APP_DIR="/var/www/ai-business-platform"
BACKUP_DIR="/var/backups/ai-business-platform"
DATE=$(date +"%Y%m%d_%H%M%S")

echo "🚀 开始部署 AI 商家服务平台..."

# 1. 备份当前版本
echo "📦 创建备份..."
mkdir -p $BACKUP_DIR
if [ -d "$APP_DIR/frontend/dist" ]; then
    tar -czf $BACKUP_DIR/backup_$DATE.tar.gz -C $APP_DIR backend frontend || true
fi

# 2. 拉取最新代码 (如果使用 Git)
# echo "📥 拉取最新代码..."
# cd $APP_DIR
# git pull origin main

# 3. 部署后端
echo "🔧 部署后端..."
cd $APP_DIR/backend
npm install --production
npm run build

# 4. 数据库迁移
echo "🗄️ 更新数据库..."
npx prisma db push

# 5. 重启后端服务
echo "🔄 重启后端服务..."
pm2 restart ai-backend || pm2 start dist/index.js --name ai-backend

# 6. 部署前端
echo "🎨 部署前端..."
cd $APP_DIR/frontend
npm install
npm run build

# 7. 重启 Nginx
echo "🌐 重启 Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "✅ 部署完成！"
echo "📅 部署时间: $DATE"
```

### 2. 设置脚本权限

```bash
chmod +x /var/www/ai-business-platform/scripts/deploy.sh
chmod +x /var/www/ai-business-platform/scripts/backup-db.sh
```

### 3. 使用部署脚本

```bash
# 执行部署
/var/www/ai-business-platform/scripts/deploy.sh
```

---

## 监控与维护

### 1. PM2 常用命令

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs ai-backend
pm2 logs ai-backend --lines 100  # 查看最后100行
pm2 logs ai-backend --err         # 只看错误日志

# 重启服务
pm2 restart ai-backend

# 停止服务
pm2 stop ai-backend

# 删除服务
pm2 delete ai-backend

# 监控面板
pm2 monit
```

### 2. Nginx 日志管理

```bash
# 查看访问日志
sudo tail -f /var/log/nginx/ai-business-platform-access.log

# 查看错误日志
sudo tail -f /var/log/nginx/ai-business-platform-error.log

# 日志轮转（已由 logrotate 自动处理）
```

### 3. 系统监控

```bash
# 查看系统资源
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h

# 查看端口占用
netstat -tlnp
```

### 4. 定期维护任务

```bash
# 编辑定时任务
crontab -e

# 添加以下任务
# 每天2点数据库备份
0 2 * * * /var/www/ai-business-platform/scripts/backup-db.sh

# 每周一3点清理日志
0 3 * * 1 find /var/log/nginx -name "*.log" -mtime +30 -delete

# 每周一4点更新系统
0 4 * * 1 apt update && apt upgrade -y >> /var/log/update.log 2>&1
```

---

## 安全建议

1. **定期更新**: 保持系统和软件包最新
2. **防火墙**: 只开放必要的端口 (80, 443, 22)
3. **SSH安全**: 禁用密码登录，使用密钥认证
4. **权限管理**: 遵循最小权限原则
5. **定期备份**: 确保数据安全
6. **监控告警**: 设置异常情况告警
7. **密钥管理**: 不要将密钥提交到代码仓库
8. **HTTPS**: 必须使用 HTTPS 加密传输

---

## 故障排查

### 后端无法启动
```bash
# 查看 PM2 日志
pm2 logs ai-backend

# 检查端口占用
netstat -tlnp | grep 3000

# 检查数据库连接
mysql -u user -p -h localhost ai_business_platform
```

### 前端无法访问
```bash
# 检查 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 检查文件权限
ls -la /var/www/ai-business-platform/frontend/dist
```

### 数据库问题
```bash
# 检查 MySQL 状态
sudo systemctl status mysql

# 检查连接
mysql -u user -p -e "SHOW DATABASES;"
```

---

## 常见问题

### Q: 如何更改域名？
A: 修改 Nginx 配置中的 `server_name`，然后重新加载 Nginx。

### Q: 如何查看应用版本？
A: 可以在 package.json 中查看版本号，或通过 Git commit 记录。

### Q: 如何回滚到上一个版本？
A: 使用备份文件恢复，或使用 Git 回退到之前的 commit。

### Q: 如何监控服务健康状态？
A: 可以使用 uptime-kuma, Prometheus + Grafana 等监控工具。

---

## 联系支持

如遇到问题，请检查日志文件，或参考相关文档。

祝您部署顺利！🎉
