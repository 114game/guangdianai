# AI 商家服务平台

一个面向本地生活服务行业商家的 AI 服务平台，提供店铺诊断、营销文案生成、AI 对话等功能。

## 功能特性

### 用户端
- 用户注册/登录（支持手机、邮箱）
- AI 对话（支持多模型切换）
- 动态 AI 应用（可配置字段和模板）
- 积分系统（卡密兑换、消费记录）
- 作品管理（历史记录、复制、下载、删除）
- 响应式设计（PC + 移动端自适应）

### 后台管理
- 用户管理
- 卡密管理
- AI 模型管理
- AI 应用管理
- 积分流水记录
- 系统配置管理

## 技术栈

### 后端
- Node.js + TypeScript
- Express.js
- Prisma ORM
- MySQL
- JWT 认证
- Winston 日志

### 前端
- Vue 3 + TypeScript
- Vite
- Pinia 状态管理
- Vue Router
- Tailwind CSS
- Axios

## 快速开始

### 环境要求
- Node.js 18+
- MySQL 8.0+
- npm 或 yarn 或 pnpm

### 数据库设置

1. 创建数据库：
```sql
CREATE DATABASE ai_business_platform DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 执行 SQL 初始化脚本（可选）：
```bash
mysql -u root -p ai_business_platform < sql/init.sql
```

### 后端启动

1. 进入后端目录：
```bash
cd backend
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量：
复制 `.env.example` 为 `.env` 并填入正确的配置：
```bash
cp .env.example .env
```

4. 初始化 Prisma：
```bash
npx prisma generate
npx prisma db push
```

5. 启动开发服务器：
```bash
npm run dev
```

后端将在 http://localhost:3000 启动

### 前端启动

1. 进入前端目录：
```bash
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

前端将在 http://localhost:5173 启动

## 项目结构

```
.
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── services/        # 业务逻辑
│   │   ├── middlewares/     # 中间件
│   │   ├── models/          # 数据模型（Prisma）
│   │   ├── routes/          # 路由
│   │   ├── utils/           # 工具函数
│   │   ├── config/          # 配置文件
│   │   └── index.ts         # 入口文件
│   ├── prisma/
│   │   └── schema.prisma    # Prisma 数据模型
│   └── package.json
├── frontend/                # 前端项目
│   ├── src/
│   │   ├── views/           # 页面组件
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── router/          # 路由配置
│   │   ├── utils/           # 工具函数
│   │   ├── App.vue
│   │   └── main.ts
│   └── package.json
├── sql/                     # 数据库脚本
└── README.md
```

## API 文档

### 公共接口

#### 获取首页数据
```
GET /api/home
```

### 用户接口

#### 手机注册
```
POST /api/user/register/phone
Body: { phone, password, code }
```

#### 邮箱注册
```
POST /api/user/register/email
Body: { email, password, code }
```

#### 手机登录
```
POST /api/user/login/phone
Body: { phone, password }
```

#### 邮箱登录
```
POST /api/user/login/email
Body: { email, password }
```

#### 获取用户信息
```
GET /api/user/info
Authorization: Bearer <token>
```

#### 兑换卡密
```
POST /api/user/card/redeem
Authorization: Bearer <token>
Body: { code }
```

### AI 应用接口

#### 获取应用列表
```
GET /api/apps
```

#### 获取应用详情
```
GET /api/apps/:id
```

#### 执行应用
```
POST /api/apps/:id/execute
Authorization: Bearer <token>
Body: { inputData }
```

### 作品接口

#### 获取作品列表
```
GET /api/works
Authorization: Bearer <token>
```

#### 获取作品详情
```
GET /api/works/:id
Authorization: Bearer <token>
```

#### 删除作品
```
DELETE /api/works/:id
Authorization: Bearer <token>
```

### 对话接口

#### 创建会话
```
POST /api/chat/sessions
Authorization: Bearer <token>
```

#### 获取会话列表
```
GET /api/chat/sessions
Authorization: Bearer <token>
```

#### 获取会话详情
```
GET /api/chat/sessions/:id
Authorization: Bearer <token>
```

#### 删除会话
```
DELETE /api/chat/sessions/:id
Authorization: Bearer <token>
```

#### 发送消息
```
POST /api/chat/messages
Authorization: Bearer <token>
Body: { sessionId, content }
```

## 部署

### 后端部署

1. 构建项目：
```bash
cd backend
npm run build
```

2. 配置生产环境变量：
确保 `.env` 文件中配置了正确的生产环境设置

3. 启动服务：
```bash
npm start
```

### 前端部署

1. 构建项目：
```bash
cd frontend
npm run build
```

2. 将 `dist` 目录部署到 Web 服务器（Nginx、Apache 等）

## 开发说明

### 添加新的 AI 模型
在数据库中添加记录到 `ChatModel` 表，配置正确的 API 地址和密钥即可。

### 创建新的 AI 应用
通过后台管理系统添加应用，配置字段和模板，系统会自动生成对应的前端表单。

## 许可证

MIT
