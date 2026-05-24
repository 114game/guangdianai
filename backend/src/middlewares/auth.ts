import { Request, Response, NextFunction } from 'express';
import { verifyToken, verifyAdminToken } from '../utils/jwt';
import { unauthorized } from '../utils/response';
import prisma from '../config/prisma';

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      adminId?: number;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, '未提供认证令牌');
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({ 
      where: { id: payload.userId },
      select: { id: true, status: true }
    });

    if (!user) {
      return unauthorized(res, '用户不存在');
    }

    if (user.status !== 1) {
      return unauthorized(res, '账号已被禁用');
    }

    req.userId = payload.userId;
    next();
  } catch (error) {
    return unauthorized(res, '认证令牌无效');
  }
};

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, '未提供认证令牌');
    }

    const token = authHeader.substring(7);
    const payload = verifyAdminToken(token);

    const admin = await prisma.admin.findUnique({ 
      where: { id: payload.adminId },
      select: { id: true, status: true }
    });

    if (!admin) {
      return unauthorized(res, '管理员不存在');
    }

    if (admin.status !== 1) {
      return unauthorized(res, '账号已被禁用');
    }

    req.adminId = payload.adminId;
    next();
  } catch (error) {
    return unauthorized(res, '认证令牌无效');
  }
};
