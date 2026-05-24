import prisma from '../config/prisma';
import { AIService } from './ai.service';
import { PointService } from './point.service';

export class AppService {
  // 获取可用的应用列表
  static async getAppList() {
    const apps = await prisma.app.findMany({
      where: { status: 1 },
      orderBy: { sort: 'asc' },
      include: {
        fields: {
        where: { status: 1 },
        orderBy: { sort: 'asc'
      }
      }
    });
    return apps;
  }

  // 获取应用详情
  static async getAppDetail(appId: number) {
    const app = await prisma.app.findUnique({
      where: { id: appId },
      include: {
        fields: {
        where: { status: 1 },
        orderBy: { sort: 'asc'
      }
      }
    });

    if (!app || app?.status !== 1) {
      throw new Error('应用不存在或已下架');
    }

    return app;
  }

  // 执行 AI 应用
  static async executeApp(
    userId: number,
    appId: number,
    inputData: Record<string, any>
  ) {
    const app = await prisma.app.findUnique({
      where: { id: appId },
      include: {
        fields: {
        where: { status: 1 },
        orderBy: { sort: 'asc'
      }
      }
    });

    if (!app || app.status !== 1) {
      throw new Error('应用不存在或已下架');
    }

    // 验证必填字段
    for (const field of app.fields) {
      if (field.required && !inputData[field.key]) {
        throw new Error(`${field.name} 不能为空`);
      }
    }

    // 检查积分
    const userPoints = await PointService.getUserPoints(userId);
    if (userPoints < app.points) {
      throw new Error('积分不足');
    }

    // 构建提示词
    let prompt = app.template;
    for (const field of app.fields) {
      const value = inputData[field.key] || field.defaultValue || '';
      prompt = prompt.replace(new RegExp(`\\{${field.key}\\}`, 'g'), String(value));
    }

    // 确定使用的模型
    let modelId = app.modelId;
    if (!modelId) {
      const defaultModel = await AIService.getDefaultModel();
      if (!defaultModel) {
        throw new Error('没有可用的模型');
      }
      modelId = defaultModel.id;
    }

    // 调用 AI 模型
    const aiResult = await AIService.chatCompletion(modelId, [
      { role: 'user', content: prompt }
    ]);

    // 扣减积分
    await PointService.deductPoints(
      userId,
      app.points,
      'consume',
      `使用应用: ${app.name}`,
      appId
    );

    // 保存作品
    const work = await prisma.work.create({
      data: {
        userId,
        appId,
        title: app.name,
        inputData,
        outputData: {
          content: aiResult.content,
          usage: aiResult.usage
        }
      }
    });

    return {
      work,
      content: aiResult.content
    };
  }

  // 获取用户作品列表
  static async getUserWorks(userId: number, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;

    const [works, total] = await Promise.all([
      prisma.work.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: { app: true }
      }),
      prisma.work.count({ where: { userId } })
    ]);

    return { works, total, page, pageSize };
  }

  // 获取作品详情
  static async getWorkDetail(userId: number, workId: number) {
    const work = await prisma.work.findUnique({
      where: { id: workId },
      include: { app: true }
    });

    if (!work || work.userId !== userId) {
      throw new Error('作品不存在');
    }

    return work;
  }

  // 删除作品
  static async deleteWork(userId: number, workId: number) {
    const work = await prisma.work.findUnique({
      where: { id: workId }
    });

    if (!work || work.userId !== userId) {
      throw new Error('作品不存在');
    }

    await prisma.work.delete({
      where: { id: workId }
    });

    return true;
  }
}
