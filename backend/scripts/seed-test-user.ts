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
