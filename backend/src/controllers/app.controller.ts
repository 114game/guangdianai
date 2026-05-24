import { Request, Response } from 'express';
import { success, error } from '../utils/response';
import { AppService } from '../services/app.service';
import prisma from '../config/prisma';
import { AIService } from '../services/ai.service';
import { PointService } from '../services/point.service';

export class AppController {
  // 获取应用列表
  static async getAppList(req: Request, res: Response) {
    try {
      const apps = await AppService.getAppList();
      success(res, apps);
    } catch (err: any) {
      error(res, err.message);
    }
  }

  // 获取应用详情
  static async getAppDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const app = await AppService.getAppDetail(Number(id));
      success(res, app);
    } catch (err: any) {
      error(res, err.message);
    }
  }

  // 执行应用
  static async executeApp(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const { inputData } = req.body;
      const result = await AppService.executeApp(userId, Number(id), inputData);
      success(res, result);
    } catch (err: any) {
      error(res, err.message);
    }
  }

  // 获取作品列表
  static async getUserWorks(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { page = 1, pageSize = 20 } = req.query;
      const result = await AppService.getUserWorks(userId, Number(page), Number(pageSize));
      success(res, result);
    } catch (err: any) {
      error(res, err.message);
    }
  }

  // 获取作品详情
  static async getWorkDetail(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const work = await AppService.getWorkDetail(userId, Number(id));
      success(res, work);
    } catch (err: any) {
      error(res, err.message);
    }
  }

  // 删除作品
  static async deleteWork(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      await AppService.deleteWork(userId, Number(id));
      success(res, null, '删除成功');
    } catch (err: any) {
      error(res, err.message);
    }
  }
}

export class ChatController {
  // 获取可用模型
  static async getModels(req: Request, res: Response) {
    try {
      const models = await prisma.chatModel.findMany({
        where: { status: 1 },
        orderBy: { sort: 'asc' }
      });
      success(res, models);
    } catch (err: any) {
      error(res, err.message);
    }
  }

  // 创建会话
  static async createSession(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { modelId } = req.body;

      let selectedModelId = modelId;
      if (!selectedModelId) {
        const defaultModel = await AIService.getDefaultModel();
        if (!defaultModel) {
          throw new Error('没有可用的模型');
        }
        selectedModelId = defaultModel.id;
      }

      const session = await prisma.chatSession.create({
        data: {
          userId,
          modelId: selectedModelId,
          title: '新对话'
        }
      });

      success(res, session, '创建成功');
    } catch (err: any) {
      error(res, err.message);
    }
  }

  // 获取会话列表
  static async getSessions(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const sessions = await prisma.chatSession.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      });
      success(res, sessions);
    } catch (err: any) {
      error(res, err.message);
    }
  }

  // 获取会话详情
  static async getSessionDetail(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const session = await prisma.chatSession.findUnique({
        where: { id: Number(id) },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (!session || session.userId !== userId) {
        throw new Error('会话不存在');
      }

      success(res, session);
    } catch (err: any) {
      error(res, err.message);
    }
  }

  // 删除会话
  static async deleteSession(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const session = await prisma.chatSession.findUnique({
        where: { id: Number(id) }
      });

      if (!session || session.userId !== userId) {
        throw new Error('会话不存在');
      }

      await prisma.chatSession.delete({
        where: { id: Number(id) }
      });

      success(res, null, '删除成功');
    } catch (err: any) {
      error(res, err.message);
    }
  }

  // 发送消息
  static async sendMessage(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { sessionId, content, modelId } = req.body;

      // 获取会话
      let session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
      });

      if (!session || session.userId !== userId) {
        throw new Error('会话不存在');
      }

      // 获取模型
      const model = await prisma.chatModel.findUnique({
        where: { id: modelId || session.modelId }
      });

      if (!model || model.status !== 1) {
        throw new Error('模型不可用');
      }

      // TODO: 检查积分，每次对话消耗积分需要配置
      const chatPoints = 1; // 默认每次消耗1积分
      const userPoints = await PointService.getUserPoints(userId);
      if (userPoints < chatPoints) {
        throw new Error('积分不足');
      }

      // 保存用户消息
      const userMessage = await prisma.chatMessage.create({
        data: {
          sessionId,
          userId,
          role: 'user',
          content
        }
      });

      // 构建消息历史
      const messages = session.messages.map(msg => ({
        role: msg.role as any,
        content: msg.content
      }));
      messages.push({ role: 'user', content });

      // 调用 AI
      const aiResult = await AIService.chatCompletion(model.id, messages);

      // 保存助手消息
      const assistantMessage = await prisma.chatMessage.create({
        data: {
          sessionId,
          userId,
          role: 'assistant',
          content: aiResult.content,
          modelId: model.id,
          points: chatPoints
        }
      });

      // 扣减积分
      await PointService.deductPoints(
        userId,
        chatPoints,
        'consume',
        'AI对话',
        sessionId
      );

      // 更新会话标题
      if (session.title === '新对话') {
        const title = content.slice(0, 20);
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { title }
        });
      }

      success(res, {
        userMessage,
        assistantMessage
      });
    } catch (err: any) {
      error(res, err.message);
    }
  }
}

export class HomeController {
  // 获取首页数据
  static async getHomeData(req: Request, res: Response) {
    try {
      const [banners, announcements, apps] = await Promise.all([
        prisma.banner.findMany({
          where: { status: 1 },
          orderBy: { sort: 'asc' }
        }),
        prisma.announcement.findMany({
          where: { status: 1 },
          orderBy: { sort: 'asc' }
        }),
        prisma.app.findMany({
          where: { status: 1 },
          orderBy: { sort: 'asc' },
          take: 10
        })
      ]);

      success(res, {
        banners,
        announcements,
        apps
      });
    } catch (err: any) {
      error(res, err.message);
    }
  }
}
