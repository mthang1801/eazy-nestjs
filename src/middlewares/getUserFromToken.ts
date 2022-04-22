import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

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

    if (!user) {
      req['user'] = null;
    }
    req['user'] = user;
    next();
  }
};
