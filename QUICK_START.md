# 快速启动指南

## 前置要求
- Node.js 18+ (已安装 npm)
- MySQL 8.0+ (本地或远程)
- Git (可选)

---

## 一、数据库设置

### 1. 创建数据库
打开 MySQL 命令行或使用图形化工具（如 Navicat、phpMyAdmin）：

```sql
CREATE DATABASE ai_business_platform DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 配置数据库连接
编辑 [backend/.env](file:///d:/光点AI项目/测试/backend/.env)，修改数据库连接字符串：

```env
DATABASE_URL="mysql://用户名:密码@localhost:3306/ai_business_platform?schema=public"
```

例如：
```env
DATABASE_URL="mysql://root:123456@localhost:3306/ai_business_platform?schema=public"
```

---

## 二、后端启动

### 1. 安装依赖
```bash
cd backend
npm install
```

### 2. 初始化 Prisma
```bash
npx prisma generate
npx prisma db push
```

### 3. 创建初始测试用户（开发用）
让我们创建一个测试用户脚本：

**新建文件：`backend/scripts/seed-test-user.ts`**

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始创建测试用户...');

  // 检查用户是否已存在
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { phone: '13800138000' },
        { email: 'test@example.com' }
      ]
    }
  });

  if (existingUser) {
    console.log('测试用户已存在，跳过创建');
    console.log('测试账号信息:');
    console.log('手机: 13800138000');
    console.log('邮箱: test@example.com');
    console.log('密码: 123456');
    return;
  }

  // 加密密码
  const hashedPassword = await bcrypt.hash('123456', 10);

  // 创建用户
  const user = await prisma.user.create({
    data: {
      phone: '13800138000',
      email: 'test@example.com',
      nickname: '测试用户',
      password: hashedPassword,
      points: 100, // 赠送100积分
      status: 1
    }
  });

  // 创建示例应用
  const app = await prisma.app.create({
    data: {
      name: '店铺诊断助手',
      icon: '🤖',
      description: '智能分析您的店铺数据，提供优化建议',
      template: '请分析以下店铺数据并提供优化建议：\n\n{{shopData}}',
      points: 5,
      status: 1,
      sort: 1
    }
  });

  // 创建应用字段
  await prisma.appField.create({
    data: {
      appId: app.id,
      name: '店铺数据',
      key: 'shopData',
      fieldType: 'textarea',
      required: true,
      placeholder: '请粘贴您的店铺经营数据（如销售额、客流量等）',
      sort: 1,
      status: 1
    }
  });

  // 创建示例公告
  await prisma.announcement.create({
    data: {
      title: '欢迎使用 AI 商家服务平台',
      content: '欢迎您使用我们的 AI 商家服务平台！现在开始体验吧。',
      type: 'fixed',
      sort: 1,
      status: 1
    }
  });

  console.log('✅ 测试数据创建成功！');
  console.log('');
  console.log('📱 测试账号信息:');
  console.log('   手机: 13800138000');
  console.log('   邮箱: test@example.com');
  console.log('   密码: 123456');
  console.log('');
  console.log('🎁 用户积分: 100');
  console.log('📦 已创建示例应用和公告');
}

main()
  .catch((e) => {
    console.error('❌ 创建测试数据失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

执行脚本创建测试数据：
```bash
# 先在 package.json 添加脚本
# "scripts": {
#   "seed:test": "ts-node scripts/seed-test-user.ts"
# }

# 或者直接运行
npx ts-node scripts/seed-test-user.ts
```

### 4. 启动后端服务
```bash
npm run dev
```

后端将在 http://localhost:3000 启动

---

## 三、前端启动

### 1. 安装依赖
```bash
cd frontend
npm install
```

### 2. 启动前端服务
```bash
npm run dev
```

前端将在 http://localhost:5173 启动

---

## 四、验证登录功能

### 1. 打开应用
访问 http://localhost:5173

### 2. 登录测试
点击首页的登录按钮，或直接访问 http://localhost:5173/login

使用以下任一账号登录：
- **手机号**: 13800138000
- **邮箱**: test@example.com
- **密码**: 123456

### 3. 验证功能
登录成功后，您可以：
- 查看首页
- 使用 AI 对话
- 测试应用功能
- 查看作品管理
- 查看积分记录

---

## 五、验证后端 API（可选）

### 1. 健康检查
访问 http://localhost:3000/health

### 2. 测试登录 API
使用 Postman 或 curl 测试：

```bash
curl -X POST http://localhost:3000/api/user/login/phone \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","password":"123456"}'
```

预期响应：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": { ... },
    "token": "..."
  }
}
```

---

## 常见问题

### Q: npm 命令找不到？
A: 请确保已安装 Node.js，并添加到系统 PATH。

### Q: 数据库连接失败？
A: 检查 .env 文件中的数据库配置，确保 MySQL 服务已启动。

### Q: Prisma 相关错误？
A: 删除 node_modules 重新安装，或检查 Node.js 版本是否 >= 18。

### Q: 前端无法连接后端？
A: 确认后端服务已启动在 3000 端口，检查 vite.config.ts 中的代理配置。

---

## 下一步

- 配置 AI 模型 API（在数据库 ChatModel 表中添加）
- 开发后台管理功能
- 配置支付和短信服务
- 部署到生产环境
