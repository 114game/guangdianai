#!/bin/bash

# =========================================
# AI 商家服务平台部署脚本
# =========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
APP_NAME="AI商家服务平台"
APP_DIR="/var/www/ai-business-platform"
BACKUP_DIR="/var/backups/ai-business-platform"
DATE=$(date +"%Y%m%d_%H%M%S")

# 打印信息函数
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

# =========================================
# 检查环境
# =========================================
check_environment() {
    print_info "检查部署环境..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装，请先安装 Node.js 20+"
        exit 1
    fi
    print_success "Node.js 版本: $(node -v)"
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        print_error "npm 未安装"
        exit 1
    fi
    
    # 检查 MySQL (可选，因为可能使用 Docker)
    if command -v mysql &> /dev/null; then
        print_success "MySQL 已安装"
    else
        print_warning "MySQL 未安装（如果使用 Docker 可忽略）"
    fi
    
    # 检查 Nginx
    if command -v nginx &> /dev/null; then
        print_success "Nginx 已安装"
    else
        print_warning "Nginx 未安装"
    fi
    
    print_success "环境检查完成"
}

# =========================================
# 创建目录
# =========================================
setup_directories() {
    print_info "创建必要的目录..."
    
    sudo mkdir -p "$APP_DIR"
    sudo mkdir -p "$BACKUP_DIR"
    sudo mkdir -p "$APP_DIR/backend/logs"
    sudo mkdir -p "$APP_DIR/backend/uploads"
    sudo mkdir -p "$APP_DIR/frontend/dist"
    
    sudo chown -R $USER:$USER "$APP_DIR"
    sudo chown -R $USER:$USER "$BACKUP_DIR"
    
    print_success "目录创建完成"
}

# =========================================
# 备份当前版本
# =========================================
backup_current() {
    print_info "备份当前版本..."
    
    if [ -d "$APP_DIR/backend" ] || [ -d "$APP_DIR/frontend" ]; then
        cd "$APP_DIR"
        tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" backend frontend 2>/dev/null || true
        print_success "备份已创建: backup_$DATE.tar.gz"
    else
        print_warning "未找到现有版本，跳过备份"
    fi
}

# =========================================
# 部署后端
# =========================================
deploy_backend() {
    print_info "部署后端服务..."
    
    cd "$APP_DIR/backend"
    
    # 安装依赖
    print_info "安装后端依赖..."
    npm ci --only=production
    
    # 生成 Prisma 客户端
    print_info "生成 Prisma 客户端..."
    npx prisma generate
    
    # 推送数据库结构
    print_info "同步数据库结构..."
    npx prisma db push
    
    # 构建项目
    print_info "构建后端项目..."
    npm run build
    
    print_success "后端部署完成"
}

# =========================================
# 部署前端
# =========================================
deploy_frontend() {
    print_info "部署前端应用..."
    
    cd "$APP_DIR/frontend"
    
    # 安装依赖
    print_info "安装前端依赖..."
    npm ci
    
    # 构建项目
    print_info "构建前端项目..."
    npm run build
    
    print_success "前端部署完成"
}

# =========================================
# 启动服务
# =========================================
start_services() {
    print_info "启动服务..."
    
    cd "$APP_DIR/backend"
    
    # 使用 PM2 启动后端
    if command -v pm2 &> /dev/null; then
        print_info "使用 PM2 启动后端..."
        pm2 delete ai-backend 2>/dev/null || true
        pm2 start dist/index.js --name ai-backend
        pm2 save
        print_success "后端服务已启动"
    else
        print_warning "PM2 未安装，请手动启动后端服务"
    fi
    
    # 重启 Nginx
    if command -v nginx &> /dev/null; then
        print_info "重启 Nginx..."
        sudo nginx -t
        sudo systemctl reload nginx || sudo service nginx reload
        print_success "Nginx 已重启"
    fi
    
    print_success "所有服务启动完成"
}

# =========================================
# 创建测试用户
# =========================================
setup_test_user() {
    print_info "设置测试用户..."
    
    if [ -f "$APP_DIR/scripts/seed-test-user.ts" ]; then
        cd "$APP_DIR"
        npx ts-node scripts/seed-test-user.ts
        print_success "测试用户设置完成"
    else
        print_warning "测试用户脚本未找到"
    fi
}

# =========================================
# 显示部署完成信息
# =========================================
show_completion() {
    echo ""
    echo "==========================================="
    echo "  ${GREEN}${APP_NAME} 部署完成！${NC}"
    echo "==========================================="
    echo ""
    echo "📱 测试账号："
    echo "   手机: 13800138000"
    echo "   邮箱: test@example.com"
    echo "   密码: 123456"
    echo ""
    echo "🌐 访问地址："
    echo "   http://your-domain.com"
    echo ""
    echo "📊 服务管理："
    echo "   pm2 status          # 查看服务状态"
    echo "   pm2 logs ai-backend # 查看后端日志"
    echo ""
    echo "💡 提示：请修改 Nginx 配置中的域名"
    echo ""
}

# =========================================
# 主函数
# =========================================
main() {
    echo ""
    echo "==========================================="
    echo "  🚀 ${APP_NAME} 部署脚本"
    echo "==========================================="
    echo ""
    
    # 检查是否提供了项目文件
    if [ ! -d "./backend" ] || [ ! -d "./frontend" ]; then
        print_error "请在项目根目录运行此脚本"
        exit 1
    fi
    
    # 执行部署步骤
    check_environment
    setup_directories
    backup_current
    
    # 复制项目文件
    print_info "复制项目文件..."
    cp -r ./backend "$APP_DIR/"
    cp -r ./frontend "$APP_DIR/"
    cp -r ./scripts "$APP_DIR/" 2>/dev/null || true
    
    deploy_backend
    deploy_frontend
    start_services
    setup_test_user
    show_completion
}

# 执行主函数
main "$@"
