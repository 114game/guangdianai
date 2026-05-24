import { Request, Response } from 'express';
import { success, error } from '../utils/response';
import { UserService } from '../services/user.service';
import { CardService } from '../services/card.service';
import { PointService } from '../services/point.service';

export class UserController {
  // 手机注册
  static async registerByPhone(req: Request, res: Response) {
    try {
      const { phone, password, code } = req.body;
      const result = await UserService.registerByPhone(phone, password, code);
      success(res, {
        user: {
          id: result.user.id,
          phone: result.user.phone,
          nickname: result.user.nickname,
          avatar: result.user.avatar,
          points: result.user.points
        },
        token: result.token
      }, '注册成功');
    } catch (err: any) {
      error(res, err.message);
    }
  }

  // 邮箱注册
  static async registerByEmail(req: Request, res: Response) {
    try {
      const { email, password, code } = req.body;
      const result = await UserService.registerByEmail(email, password, code);
      success(res, {
        user: {
          id: result.user.id,
          email: result.user.email,
          nickname: result.user.nickname,
          avatar: result.user.avatar,
          points: result.user.points
        },
        token: result.token
      }, '注册成功');
    } catch (err: any) {
      error(res, err.message);
    }
  }

  // 手机登录
  static async loginByPhone(req: Request, res: Response) {
    try {
      const { phone, password } = req.body;
      const result = await UserService.loginByPhone(phone, password);
      success(res, {
        user: {
          id: result.user.id,
          phone: result.user.phone,
          nickname: result.user.nickname,
          avatar: result.user.avatar,
          points: result.user.points
        },
        token: result.token
      }, '登录成功');
    } catch (err: any) {
      error(res, err.message);
    }
  }

  // 邮箱登录
  static async loginByEmail(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await UserService.loginByEmail(email, password);
      success(res, {
        user: {
          id: result.user.id,
          email: result.user.email,
          nickname: result.user.nickname,
          avatar: result.user.avatar,
          points: result.user.points
        },
        token: result.token
      }, '登录成功');
    } catch (err: any) {
      error(res, err.message);
    }
  }

  // 获取用户信息
  static async getUserInfo(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const user = await UserService.getUserInfo(userId);
      success(res, user);
    } catch (err: any) {
      error(res, err.message);
    }
  }

  // 更新用户信息
  static async updateUserInfo(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { nickname, avatar } = req.body;
      const user = await UserService.updateUserInfo(userId, { nickname, avatar });
      success(res, user, '更新成功');
    } catch (err: any) {
      error(res, err.message);
    }
  }

  // 修改密码
  static async changePassword(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { oldPassword, newPassword } = req.body;
      await UserService.changePassword(userId, oldPassword, newPassword);
      success(res, null, '修改成功');
    } catch (err: any) {
      error(res, err.message);
    }
  }

  // 兑换卡密
  static async redeemCard(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { code } = req.body;
      const result = await CardService.redeemCard(userId, code);
      success(res, {
        points: result.user.points
      }, '兑换成功');
    } catch (err: any) {
      error(res, err.message);
    }
  }

  // 获取积分流水
  static async getPointLogs(req: Request, res: Response) {
    try {
      const userId = req.userId!;
      const { page = 1, pageSize = 20 } = req.query;
      const result = await PointService.getPointLogs(userId, Number(page), Number(pageSize));
      success(res, result);
    } catch (err: any) {
      error(res, err.message);
    }
  }
}
