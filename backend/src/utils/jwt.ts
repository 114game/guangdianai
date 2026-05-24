import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: number;
}

interface AdminJwtPayload {
  adminId: number;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '7d' });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
};

export const generateAdminToken = (payload: AdminJwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_ADMIN_SECRET as string, { expiresIn: '1d' });
};

export const verifyAdminToken = (token: string): AdminJwtPayload => {
  return jwt.verify(token, process.env.JWT_ADMIN_SECRET as string) as AdminJwtPayload;
};
