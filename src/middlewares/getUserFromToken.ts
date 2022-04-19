import { Request, Response, NextFunction } from 'express';

export const getUserFromToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(8, req);
  next();
};
