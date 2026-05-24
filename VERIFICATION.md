# 登录功能验证指南

## 快速启动步骤总结

### 1. 确保已安装所需软件
- **Node.js**: https://nodejs.org/ (推荐 v18 或更高)
- **MySQL**: https://dev.mysql.com/downloads/mysql/

### 2. 数据库准备

**创建数据库**:
```sql
CREATE DATABASE ai_business_platform DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**配置连接**:
编辑 `backend/.env` 文件中的数据库连接字符串:
```
DATABASE_URL="mysql://root:你的密码@localhost:3306/ai_business_platform?schema=public"
```

### 3. 后端设置与启动

**打开终端 1 (后端)**:
```bash
cd backend

# 安装依赖
npm install

# 初始化 Prisma
npx prisma generate
npx prisma db push

# 创建测试用户
npm run seed:test

# 启动后端服务
npm run dev
```

后端将在 http://localhost:3000 启动

### 4. 前端设置与启动

**打开终端 2 (前端)**:
```bash
cd frontend

# 安装依赖
npm install

# 启动前端服务
npm run dev
```

前端将在 http://localhost:5173 启动

### 5. 验证登录功能

**访问应用**: http://localhost:5173

**测试账号**:
- 手机号: 13800138000
- 邮箱: test@example.com
- 密码: 123456

---

## 验证检查清单

### 后端检查
- [ ] 数据库连接成功
- [ ] Prisma 初始化完成
- [ ] 测试用户创建成功
- [ ] 后端服务在 3000 端口运行
- [ ] 访问 http://localhost:3000/health 返回 {"status":"ok"}

### 前端检查
- [ ] 依赖安装成功
- [ ] 前端服务在 5173 端口运行
- [ ] 页面正常加载
- [ ] 可以正常访问 http://localhost:5173

### 登录功能检查
- [ ] 可以访问登录页面 http://localhost:5173/login
- [ ] 手机号登录: 使用 13800138000 / 123456
- [ ] 邮箱登录: 使用 test@example.com / 123456
- [ ] 登录成功后跳转到首页
- [ ] 右上角显示用户信息和积分
- [ ] 可以正常退出登录

### API 验证 (可选)

**使用 curl 测试登录接口**:

手机号登录:
```bash
curl -X POST http://localhost:3000/api/user/login/phone \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"13800138000\",\"password\":\"123456\"}"
```

邮箱登录:
```bash
curl -X POST http://localhost:3000/api/user/login/email \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"123456\"}"
```

预期响应:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "phone": "13800138000",
      "nickname": "测试用户",
      "points": 100
    },
    "token": "..."
  }
}
```

---

## 常见问题

### 1. npm 命令找不到
- 确认已安装 Node.js
- 重启终端
- 检查 PATH 环境变量

### 2. 数据库连接失败
- 确认 MySQL 服务正在运行
- 检查用户名密码是否正确
- 确认数据库已创建

### 3. Prisma 错误
```bash
# 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install
```

### 4. 前端无法连接后端
- 确认后端正在运行
- 检查 vite.config.ts 代理配置
- 检查浏览器控制台错误信息

### 5. 登录失败提示"密码错误"
- 确认使用了测试账号
- 重新运行 seed:test 创建用户

---

## 下一步

登录成功后，您可以:
1. 尝试 AI 对话功能
2. 测试应用执行
3. 查看作品管理
4. 测试积分消费
5. 测试卡密兑换
