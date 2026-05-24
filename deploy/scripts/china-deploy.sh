#!/bin/bash

# =========================================
# 🚀 AI商家服务平台 - 国内服务器一键部署脚本
# 项目地址: https://github.com/114Game/guangdianai
# 专为国内服务器优化
# =========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
APP_NAME="guangdianai"
# 使用GitHub镜像站
GITHUB_MIRRORS=(
    "https://ghproxy.com/https://github.com/114Game/guangdianai.git"
    "https://gh.api.99988866.xyz/https://github.com/114Game/guangdianai.git"
    "https://mirror.ghproxy.com/https://github.com/114Game/guangdianai.git"
    "https://github.com.cnpmjs.org/114Game/guangdianai.git"
)
INSTALL_DIR="/var/www/guangdianai"
DB_NAME="guangdianai"
DB_USER="guangdianai"
BACKUP_DIR="/var/backups/guangdianai"
DATE=$(date +"%Y%m%d_%H%M%S")

# 打印函数
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo ""
    echo "=========================================="
    echo -e "  🚀  ${1}"
    echo "=========================================="
}

# 配置国内镜像源
setup_china_mirrors() {
    print_header "配置国内镜像源"
    
    if [[ "$OS" == "ubuntu" || "$OS" == "debian" ]]; then
        # 配置Ubuntu/Debian镜像源
        cp /etc/apt/sources.list /etc/apt/sources.list.bak
        
        if [[ "$OS" == "ubuntu" ]]; then
            # Ubuntu 20.04+
            cat > /etc/apt/sources.list <<END_SOURCES
deb http://mirrors.aliyun.com/ubuntu/ focal main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ focal-security main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ focal-updates main restricted universe multiverse
END_SOURCES
        fi
        
        apt update -y
    fi
    
    # 配置npm镜像
    npm config set registry https://registry.npmmirror.com
    
    # 配置pip镜像（如果需要）
    
    print_success "国内镜像源配置完成"
}

# 使用镜像尝试克隆
clone_with_mirrors() {
    print_header "尝试克隆项目"
    
    if [ -d "$INSTALL_DIR" ]; then
        print_warning "目标目录已存在: $INSTALL_DIR"
        read -p "是否删除并重新克隆? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$INSTALL_DIR"
        else
            if [ "$1" == "--update" ]; then
                cd "$INSTALL_DIR"
                git pull origin main
                return
            fi
            print_warning "使用现有目录"
            return
        fi
    fi
    
    mkdir -p "$(dirname $INSTALL_DIR)"
    
    # 尝试各个镜像站
    for mirror in "${GITHUB_MIRRORS[@]}"; do
        print_info "尝试使用镜像: $mirror"
        if git clone "$mirror" "$INSTALL_DIR"; then
            print_success "克隆成功！"
            cd "$INSTALL_DIR"
            git remote set-url origin "https://github.com/114Game/guangdianai.git"
            return
        fi
        print_warning "此镜像克隆失败，尝试下一个..."
    done
    
    print_error "所有镜像都失败了，请尝试其他方案"
    exit 1
}

# 检查root权限
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_warning "建议使用 root 用户运行此脚本"
        read -p "是否继续? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# 检测系统
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        OS_VERSION=$VERSION_ID
    else
        print_error "无法检测操作系统"
        exit 1
    fi
    
    print_info "检测到操作系统: $OS $OS_VERSION"
}

# 检查端口
check_port() {
    local port=$1
    if command -v netstat &> /dev/null; then
        if netstat -tlnp | grep -q ":$port "; then
            return 1
        fi
    elif command -v ss &> /dev/null; then
        if ss -tlnp | grep -q ":$port "; then
            return 1
        fi
    fi
    return 0
}

# 安装基础工具
install_base() {
    print_header "安装基础工具"
    
    if [[ "$OS" == "ubuntu" || "$OS" == "debian" ]]; then
        apt install -y git curl wget ca-certificates software-properties-common
    elif [[ "$OS" == "centos" || "$OS" == "rhel" ]]; then
        yum install -y git curl wget ca-certificates
    else
        print_error "不支持的操作系统: $OS"
        exit 1
    fi
    
    print_success "基础工具安装完成"
}

# 安装 Node.js（使用国内镜像）
install_nodejs() {
    print_header "安装 Node.js 20"
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | sed 's/v//')
        if [[ "$(printf '%s\n' "$NODE_VERSION" "20.0.0" | sort -V | head -n1)" != "20.0.0" ]]; then
            print_warning "Node.js 版本过低 ($NODE_VERSION)，需要 20+"
        else
            print_success "Node.js 已安装: $NODE_VERSION"
            return
        fi
    fi
    
    if [[ "$OS" == "ubuntu" || "$OS" == "debian" ]]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt install -y nodejs
    elif [[ "$OS" == "centos" || "$OS" == "rhel" ]]; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        yum install -y nodejs
    fi
    
    print_success "Node.js 安装完成: $(node -v)"
}

# 安装 PM2
install_pm2() {
    print_header "安装 PM2"
    
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2 --registry=https://registry.npmmirror.com
    fi
    
    print_success "PM2 安装完成"
}

# 安装 Nginx
install_nginx() {
    print_header "安装 Nginx"
    
    if ! command -v nginx &> /dev/null; then
        if [[ "$OS" == "ubuntu" || "$OS" == "debian" ]]; then
            apt install -y nginx
        elif [[ "$OS" == "centos" || "$OS" == "rhel" ]]; then
            yum install -y nginx
        fi
        systemctl enable nginx
    fi
    
    systemctl start nginx
    print_success "Nginx 安装完成"
}

# 安装 MySQL
install_mysql() {
    print_header "安装 MySQL"
    
    if ! command -v mysql &> /dev/null; then
        if [[ "$OS" == "ubuntu" || "$OS" == "debian" ]]; then
            apt install -y mysql-server
        elif [[ "$OS" == "centos" || "$OS" == "rhel" ]]; then
            yum install -y mysql-server
        fi
        systemctl enable mysql
    fi
    
    systemctl start mysql
    print_success "MySQL 安装完成"
}

# 配置数据库
setup_database() {
    print_header "配置数据库"
    
    DB_PASS=$(openssl rand -base64 12 | tr -dc 'a-zA-Z0-9' | head -c16)
    
    mysql -u root <<MYSQL_SCRIPT
CREATE DATABASE IF NOT EXISTS $DB_NAME DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
MYSQL_SCRIPT
    
    print_success "数据库配置完成"
    print_info "数据库名称: $DB_NAME"
    print_info "数据库用户: $DB_USER"
    print_info "数据库密码: $DB_PASS"
}

# 配置环境变量
setup_env() {
    print_header "配置环境变量"
    
    cd "$INSTALL_DIR"
    
    if [ ! -f "backend/.env" ]; then
        if [ -f "backend/.env.example" ]; then
            cp "backend/.env.example" "backend/.env"
        else
            print_error "未找到 .env.example 文件"
            exit 1
        fi
    fi
    
    JWT_SECRET=$(openssl rand -base64 32)
    JWT_ADMIN_SECRET=$(openssl rand -base64 32)
    
    cat > backend/.env <<END_ENV
NODE_ENV=production
PORT=3000
DATABASE_URL="mysql://$DB_USER:$DB_PASS@localhost:3306/$DB_NAME?schema=public"
JWT_SECRET="$JWT_SECRET"
JWT_ADMIN_SECRET="$JWT_ADMIN_SECRET"
END_ENV
    
    print_success "环境变量配置完成"
}

# 安装依赖并构建（使用国内镜像）
build_project() {
    print_header "构建项目"
    
    cd "$INSTALL_DIR/backend"
    npm ci --only=production --registry=https://registry.npmmirror.com
    npx prisma generate
    npx prisma db push
    npm run build
    
    cd "$INSTALL_DIR/frontend"
    npm ci --registry=https://registry.npmmirror.com
    npm run build
    
    print_success "项目构建完成"
}

# 创建测试用户
create_test_user() {
    print_header "创建测试用户"
    
    cd "$INSTALL_DIR/backend"
    
    if [ -f "scripts/seed-test-user.ts" ]; then
        npx ts-node scripts/seed-test-user.ts
        print_success "测试用户创建完成"
    else
        print_warning "未找到测试用户创建脚本"
    fi
}

# 启动后端服务
start_backend() {
    print_header "启动后端服务"
    
    cd "$INSTALL_DIR/backend"
    
    pm2 delete guangdianai-backend 2>/dev/null || true
    pm2 start dist/index.js --name guangdianai-backend
    pm2 save
    
    print_success "后端服务启动完成"
}

# 配置 Nginx
setup_nginx() {
    print_header "配置 Nginx"
    
    cd "$INSTALL_DIR"
    
    if [ -f "deploy/nginx/ai-business-platform.conf" ]; then
        cp "deploy/nginx/ai-business-platform.conf" "/etc/nginx/sites-available/$APP_NAME.conf"
        
        sed -i "s|/var/www/ai-business-platform|$INSTALL_DIR|g" "/etc/nginx/sites-available/$APP_NAME.conf"
        sed -i "s|server_name.*;|server_name _;|g" "/etc/nginx/sites-available/$APP_NAME.conf"
        
        ln -sf "/etc/nginx/sites-available/$APP_NAME.conf" "/etc/nginx/sites-enabled/"
        
        if nginx -t; then
            systemctl reload nginx
            print_success "Nginx 配置完成"
        else
            print_error "Nginx 配置测试失败"
        fi
    else
        print_warning "未找到 Nginx 配置文件"
    fi
}

# 配置防火墙
setup_firewall() {
    print_header "配置防火墙"
    
    if command -v ufw &> /dev/null; then
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw --force enable
        print_success "UFW 防火墙配置完成"
    elif command -v firewall-cmd &> /dev/null; then
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --reload
        print_success "Firewalld 防火墙配置完成"
    else
        print_warning "未检测到防火墙"
    fi
}

# 显示完成信息
show_complete() {
    print_header "部署完成"
    
    echo ""
    echo -e "  ${GREEN}✅ 部署成功！${NC}"
    echo ""
    echo "  📱 测试账号："
    echo "     手机号：13800138000"
    echo "     邮箱：test@example.com"
    echo "     密码：123456"
    echo ""
    echo "  🌐 访问地址："
    echo "     http://$(hostname -I | awk '{print $1}')"
    echo ""
    echo "  📊 服务管理："
    echo "     pm2 status              # 查看服务状态"
    echo "     pm2 logs guangdianai-backend # 查看日志"
    echo "     pm2 restart guangdianai-backend # 重启服务"
    echo ""
    echo "  🛡️  重要信息："
    echo "     请妥善保存以下信息！"
    echo "     数据库用户：$DB_USER"
    echo "     数据库密码：$DB_PASS"
    echo ""
    echo "  📝 下一步："
    echo "     1. 配置域名（如有）"
    echo "     2. 配置 HTTPS 证书"
    echo "     3. 修改默认密码"
    echo "     4. 设置自动备份"
    echo ""
}

# 更新部署
update_deploy() {
    print_header "更新部署"
    
    cd "$INSTALL_DIR"
    
    if [ -d "dist" ] || [ -d "node_modules" ]; then
        mkdir -p "$BACKUP_DIR"
        tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" --exclude="node_modules" --exclude=".git" .
    fi
    
    git pull origin main
    
    build_project
    
    pm2 restart guangdianai-backend
    
    print_success "更新完成"
}

# 主函数
main() {
    print_header "AI商家服务平台 - 国内服务器一键部署"
    echo ""
    
    if [ "$1" == "--update" ]; then
        update_deploy
        exit 0
    fi
    
    print_warning "此脚本将执行以下操作："
    echo "  - 配置国内镜像源"
    echo "  - 安装必要软件（Node.js, Nginx, MySQL）"
    echo "  - 通过GitHub镜像克隆项目到 $INSTALL_DIR"
    echo "  - 配置数据库"
    echo "  - 构建并启动应用"
    echo ""
    read -p "是否继续? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "安装已取消"
        exit 0
    fi
    
    check_root
    detect_os
    setup_china_mirrors
    install_base
    install_nodejs
    install_pm2
    install_nginx
    install_mysql
    clone_with_mirrors
    setup_database
    setup_env
    build_project
    create_test_user
    start_backend
    setup_nginx
    setup_firewall
    show_complete
}

main "$@"
