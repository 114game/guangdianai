#!/bin/bash

# =========================================
# AI 商家服务平台数据库备份脚本
# =========================================

set -e

# 配置变量
APP_NAME="AI商家服务平台"
BACKUP_DIR="/var/backups/ai-business-platform"
DATE=$(date +"%Y%m%d_%H%M%S")
KEEP_DAYS=7

# 数据库配置 - 从环境变量读取或使用默认值
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-ai_business_platform}"
DB_USER="${DB_USER:-ai_platform_user}"
DB_PASS="${DB_PASS:-}"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
# 创建备份目录
# =========================================
setup_backup_dir() {
    print_info "创建备份目录..."
    mkdir -p "$BACKUP_DIR"
    chmod 700 "$BACKUP_DIR"
}

# =========================================
# 备份数据库
# =========================================
backup_database() {
    print_info "开始备份数据库: $DB_NAME"
    
    local BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql.gz"
    
    # 使用 mysqldump 备份并压缩
    if mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" | gzip > "$BACKUP_FILE"; then
        local FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        print_success "数据库备份完成: $BACKUP_FILE ($FILE_SIZE)"
    else
        print_error "数据库备份失败"
        exit 1
    fi
}

# =========================================
# 备份上传文件 (可选)
# =========================================
backup_files() {
    local UPLOAD_DIR="/var/www/ai-business-platform/backend/uploads"
    
    if [ -d "$UPLOAD_DIR" ] && [ "$(ls -A $UPLOAD_DIR)" ]; then
        print_info "备份上传文件..."
        local FILE_BACKUP="$BACKUP_DIR/files_backup_$DATE.tar.gz"
        tar -czf "$FILE_BACKUP" -C "$(dirname $UPLOAD_DIR)" "$(basename $UPLOAD_DIR)" 2>/dev/null || true
        print_success "文件备份完成"
    fi
}

# =========================================
# 清理旧备份
# =========================================
cleanup_old_backups() {
    print_info "清理 $KEEP_DAYS 天前的备份..."
    
    local OLD_BACKUPS=$(find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +$KEEP_DAYS)
    local OLD_FILES=$(find "$BACKUP_DIR" -name "files_backup_*.tar.gz" -mtime +$KEEP_DAYS)
    
    if [ -n "$OLD_BACKUPS" ] || [ -n "$OLD_FILES" ]; then
        find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +$KEEP_DAYS -delete
        find "$BACKUP_DIR" -name "files_backup_*.tar.gz" -mtime +$KEEP_DAYS -delete
        print_success "旧备份清理完成"
    else
        print_info "没有需要清理的旧备份"
    fi
}

# =========================================
# 列出备份文件
# =========================================
list_backups() {
    echo ""
    echo "可用的数据库备份："
    echo "----------------------------------------"
    ls -lh "$BACKUP_DIR"/db_backup_*.sql.gz 2>/dev/null || echo "暂无备份"
    echo ""
}

# =========================================
# 显示帮助
# =========================================
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项："
    echo "  -b, --backup     执行备份 (默认)"
    echo "  -l, --list       列出备份文件"
    echo "  -c, --cleanup    清理旧备份"
    echo "  -h, --help       显示帮助信息"
    echo ""
    echo "示例："
    echo "  $0                    # 执行完整备份"
    echo "  $0 --list            # 列出所有备份"
    echo "  $0 --cleanup         # 仅清理旧备份"
    echo ""
    echo "配置："
    echo "  通过环境变量配置数据库连接："
    echo "  DB_HOST      数据库主机 (默认: localhost)"
    echo "  DB_PORT      数据库端口 (默认: 3306)"
    echo "  DB_NAME      数据库名称 (默认: ai_business_platform)"
    echo "  DB_USER      数据库用户名 (默认: ai_platform_user)"
    echo "  DB_PASS      数据库密码"
    echo "  KEEP_DAYS    保留天数 (默认: 7)"
    echo ""
}

# =========================================
# 主函数
# =========================================
main() {
    case "${1:-backup}" in
        -b|--backup)
            setup_backup_dir
            backup_database
            backup_files
            cleanup_old_backups
            list_backups
            print_success "备份任务完成！"
            ;;
        -l|--list)
            list_backups
            ;;
        -c|--cleanup)
            setup_backup_dir
            cleanup_old_backups
            print_success "清理任务完成！"
            ;;
        -h|--help)
            show_help
            ;;
        *)
            echo "未知选项: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
