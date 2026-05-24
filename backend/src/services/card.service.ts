import prisma from '../config/prisma';
import { PointService } from './point.service';
import { v4 as uuidv4 } from 'uuid';

export class CardService {
  // 兑换卡密
  static async redeemCard(userId: number, code: string) {
    return await prisma.$transaction(async (tx) => {
      const card = await tx.card.findUnique({
        where: { code }
      });

      if (!card) {
        throw new Error('卡密不存在');
      }

      if (card.status !== 0) {
        throw new Error('卡密已使用或已过期');
      }

      if (card.expireAt && new Date() > card.expireAt) {
        await tx.card.update({
          where: { id: card.id },
          data: { status: 2 }
        });
        throw new Error('卡密已过期');
      }

      await tx.card.update({
        where: { id: card.id },
        data: {
          status: 1,
          usedAt: new Date(),
          usedBy: userId
        }
      });

      await tx.cardLog.create({
        data: {
          cardId: card.id,
          userId,
          points: card.points
        }
      });

      const result = await PointService.addPoints(
        userId,
        card.points,
        'exchange',
        `卡密兑换: ${code}`,
        card.id
      );

      return result;
    });
  }

  // 生成卡密
  static async generateCards(count: number, points: number, expireAt?: Date) {
    const batchNo = uuidv4();
    const cards: Array<{ code: string; points: number; batchNo: string; expireAt?: Date }> = [];

    for (let i = 0; i < count; i++) {
      const code = this.generateCardCode();
      cards.push({
        code,
        points,
        batchNo,
        expireAt
      });
    }

    const result = await prisma.card.createMany({
      data: cards
    });

    return { count: result.count, batchNo, cards };
  }

  // 生成卡密编码
  private static generateCardCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) {
        code += '-';
      }
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // 查询卡密列表
  static async getCardList(params: {
    page?: number;
    pageSize?: number;
    status?: number;
    batchNo?: string;
  }) {
    const { page = 1, pageSize = 20, status, batchNo } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (status !== undefined) where.status = status;
    if (batchNo) where.batchNo = batchNo;

    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          usedByUser: {
            select: { id: true, phone: true, nickname: true }
          }
        }
      }),
      prisma.card.count({ where })
    ]);

    return { cards, total, page, pageSize };
  }
}
