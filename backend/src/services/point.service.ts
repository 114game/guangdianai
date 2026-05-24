import prisma from '../config/prisma';

export class PointService {
  // 增加积分
  static async addPoints(userId: number, amount: number, type: string, remark: string, relatedId?: number) {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, points: true }
      });

      if (!user) {
        throw new Error('用户不存在');
      }

      const newBalance = user.points + amount;

      await tx.user.update({
        where: { id: userId },
        data: { points: newBalance }
      });

      const log = await tx.pointLog.create({
        data: {
          userId,
          type,
          amount,
          balance: newBalance,
          remark,
          relatedId
        }
      });

      return { user: { ...user, points: newBalance }, log };
    });
  }

  // 扣减积分（原子操作，防止并发）
  static async deductPoints(userId: number, amount: number, type: string, remark: string, relatedId?: number) {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, points: true }
      });

      if (!user) {
        throw new Error('用户不存在');
      }

      if (user.points < amount) {
        throw new Error('积分不足');
      }

      const newBalance = user.points - amount;

      await tx.user.update({
        where: { id: userId },
        data: { points: newBalance }
      });

      const log = await tx.pointLog.create({
        data: {
          userId,
          type,
          amount: -amount,
          balance: newBalance,
          remark,
          relatedId
        }
      });

      return { user: { ...user, points: newBalance }, log };
    });
  }

  // 查询用户积分
  static async getUserPoints(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true }
    });
    return user?.points || 0;
  }

  // 查询积分流水
  static async getPointLogs(userId: number, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;
    
    const [logs, total] = await Promise.all([
      prisma.pointLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.pointLog.count({ where: { userId } })
    ]);

    return { logs, total, page, pageSize };
  }
}
