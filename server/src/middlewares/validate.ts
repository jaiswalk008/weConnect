import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

export const validate = (schema: z.ZodObject<any>) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
       if (error instanceof z.ZodError) {
        const message = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw new ValidationError(message);
      }
      next(error);
    }
  };
