-- 创建数据库
CREATE DATABASE IF NOT EXISTS ai_business_platform DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ai_business_platform;

-- 初始化管理员账号 (需要在 Prisma 生成后通过代码或直接数据库操作创建)
-- 示例插入一些测试数据，实际项目中应该通过后台管理系统添加

-- 插入示例聊天模型配置
-- INSERT INTO ChatModel (name, code, apiUrl, apiKey, modelType, status, isDefault, sort, createdAt, updatedAt)
-- VALUES
-- ('GPT-4', 'gpt-4', 'https://api.openai.com/v1/chat/completions', 'your-api-key', 'chat', 1, 1, 1, NOW(), NOW()),
-- ('Claude 3', 'claude-3', 'https://api.anthropic.com/v1/messages', 'your-api-key', 'chat', 1, 0, 2, NOW(), NOW());

-- 插入示例 AI 应用
-- INSERT INTO App (name, icon, description, template, points, modelId, status, sort, createdAt, updatedAt)
-- VALUES
-- ('店铺诊断', '🤖', '智能分析您的店铺数据', '请分析以下店铺数据：{{data}}', 5, NULL, 1, 1, NOW(), NOW()),
-- ('营销文案生成', '📝', '一键生成营销文案', '请为以下产品生成营销文案：{{product}}', 3, NULL, 1, 2, NOW(), NOW());

-- 插入示例应用字段
-- INSERT INTO AppField (appId, name, key, fieldType, required, defaultValue, options, placeholder, sort, status, createdAt, updatedAt)
-- VALUES
-- (1, '店铺数据', 'data', 'textarea', 1, NULL, NULL, '请粘贴店铺数据', 1, 1, NOW(), NOW()),
-- (2, '产品信息', 'product', 'text', 1, NULL, NULL, '请输入产品信息', 1, 1, NOW(), NOW());

-- 插入示例公告
-- INSERT INTO Announcement (title, content, type, sort, status, createdAt, updatedAt)
-- VALUES
-- ('欢迎使用', '欢迎使用 AI 商家服务平台！', 'fixed', 1, 1, NOW(), NOW());
