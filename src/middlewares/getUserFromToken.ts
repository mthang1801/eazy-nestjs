import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { decodeBase64String } from '../utils/cipherHelper';

export const getUserFromToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authoriazationToken = req.headers?.authorization;

  if (!authoriazationToken) {
    req['user'] = null;
    next();
  } else {
    const token = authoriazationToken.split(' ').slice(-1)[0].trim();

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decoded || +decoded['exp'] * 1000 - Date.now() < 0) {
      req['user'] = null;
    }

    const user = decoded?.sub;

    if (!user || !user['user_id']) {
      req['user'] = null;
    }

    const userId = user['user_id'];
    user['user_id'] = userId;

    req['user'] = user;
    next();
  }
};
