import prisma from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

export class UserService {
  // 手机注册
  static async registerByPhone(phone: string, password: string, code: string) {
    const existingUser = await prisma.user.findUnique({
      where: { phone }
    });

    if (existingUser) {
      throw new Error('手机号已注册');
    }

    // TODO: 验证短信验证码

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        nickname: `用户${phone.slice(-4)}`,
        points: 0
      }
    });

    const token = generateToken({ userId: user.id });

    return { user, token };
  }

  // 邮箱注册
  static async registerByEmail(email: string, password: string, code: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('邮箱已注册');
    }

    // TODO: 验证邮箱验证码

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname: `用户${email.split('@')[0]}`,
        points: 0
      }
    });

    const token = generateToken({ userId: user.id });

    return { user, token };
  }

  // 手机登录
  static async loginByPhone(phone: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    if (user.status !== 1) {
      throw new Error('账号已被禁用');
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      throw new Error('密码错误');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    await prisma.loginLog.create({
      data: {
        userId: user.id,
        loginType: 'phone'
      }
    });

    const token = generateToken({ userId: user.id });

    return { user, token };
  }

  // 邮箱登录
  static async loginByEmail(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    if (user.status !== 1) {
      throw new Error('账号已被禁用');
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      throw new Error('密码错误');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    await prisma.loginLog.create({
      data: {
        userId: user.id,
        loginType: 'email'
      }
    });

    const token = generateToken({ userId: user.id });

    return { user, token };
  }

  // 获取用户信息
  static async getUserInfo(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        email: true,
        nickname: true,
        avatar: true,
        points: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    return user;
  }

  // 更新用户信息
  static async updateUserInfo(userId: number, data: {
    nickname?: string;
    avatar?: string;
  }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        phone: true,
        email: true,
        nickname: true,
        avatar: true,
        points: true,
        createdAt: true
      }
    });

    return user;
  }

  // 修改密码
  static async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    const isValid = await comparePassword(oldPassword, user.password);
    if (!isValid) {
      throw new Error('原密码错误');
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return true;
  }
}
