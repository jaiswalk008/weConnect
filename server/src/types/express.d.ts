import { JwtPayload } from './user';
import { User } from '@prisma/client';

declare global {
  namespace Express {
    // This extends the Express User type to include our JwtPayload properties
    // interface User extends JwtPayload {}

    // This extends the Express Request type to include the user property
    interface Request {
      user?: User;
    }
  }
}
