import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { AppController, ChatController, HomeController } from '../controllers/app.controller';
import { auth } from '../middlewares/auth';

const router = Router();

// 首页
router.get('/home', HomeController.getHomeData);

// 用户相关
router.post('/user/register/phone', UserController.registerByPhone);
router.post('/user/register/email', UserController.registerByEmail);
router.post('/user/login/phone', UserController.loginByPhone);
router.post('/user/login/email', UserController.loginByEmail);
router.get('/user/info', auth, UserController.getUserInfo);
router.put('/user/info', auth, UserController.updateUserInfo);
router.put('/user/password', auth, UserController.changePassword);
router.post('/user/card/redeem', auth, UserController.redeemCard);
router.get('/user/points/logs', auth, UserController.getPointLogs);

// AI 应用相关
router.get('/apps', AppController.getAppList);
router.get('/apps/:id', AppController.getAppDetail);
router.post('/apps/:id/execute', auth, AppController.executeApp);
router.get('/works', auth, AppController.getUserWorks);
router.get('/works/:id', auth, AppController.getWorkDetail);
router.delete('/works/:id', auth, AppController.deleteWork);

// 聊天相关
router.get('/chat/models', ChatController.getModels);
router.post('/chat/sessions', auth, ChatController.createSession);
router.get('/chat/sessions', auth, ChatController.getSessions);
router.get('/chat/sessions/:id', auth, ChatController.getSessionDetail);
router.delete('/chat/sessions/:id', auth, ChatController.deleteSession);
router.post('/chat/messages', auth, ChatController.sendMessage);

export default router;
