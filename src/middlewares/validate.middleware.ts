import { StatusCodes } from 'http-status-codes';
import { NextFunction, Response } from 'express';
import { ZodType } from 'zod';

export const validate = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: result.error });
  }
  next();
};
