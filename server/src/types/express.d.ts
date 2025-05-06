import { Document } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: Document & {
        id: string;
        name: string;
        email: string;
        role: string;
        changedPasswordAfter?: (timestamp: number) => boolean;
        [key: string]: any;
      };
      resource?: Document & {
        user?: any;
        [key: string]: any;
      };
    }
  }
}

// Đảm bảo file này được coi là một module
export {};