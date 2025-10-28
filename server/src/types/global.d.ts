import { JwtPayload } from './user';

declare global {
  namespace Express {
    // This extends the Express User type to include our JwtPayload properties
    interface User extends JwtPayload {}

    // This extends the Express Request type to include the user property
    interface Request {
      userId: number;
    }
  }
}
