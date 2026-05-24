import { Response } from 'express';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

export const success = <T>(res: Response, data?: T, message: string = 'success'): Response => {
  return res.json({
    code: 200,
    message,
    data,
  });
};

export const error = (res: Response, message: string = 'error', code: number = 400): Response => {
  return res.status(code).json({
    code,
    message,
  });
};

export const unauthorized = (res: Response, message: string = 'Unauthorized'): Response => {
  return res.status(401).json({
    code: 401,
    message,
  });
};

export const forbidden = (res: Response, message: string = 'Forbidden'): Response => {
  return res.status(403).json({
    code: 403,
    message,
  });
};

export const notFound = (res: Response, message: string = 'Not Found'): Response => {
  return res.status(404).json({
    code: 404,
    message,
  });
};
