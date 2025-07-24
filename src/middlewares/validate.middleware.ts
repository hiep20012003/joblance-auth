import { NextFunction, Response, Request } from 'express';
import { ZodType, z } from 'zod';
import { BadRequestError } from '@hiep20012003/joblance-shared';

export const validate = (schema: ZodType) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const flattened = z.flattenError(result.error);

    throw new BadRequestError({
      clientMessage: 'Validation error',
      operation: 'validate-signup',
      context: { ...flattened },
    });
  }

  req.body = result.data;
  next();
};
