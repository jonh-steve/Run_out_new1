// Mở rộng kiểu Request từ Express
declare namespace Express {
    export interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        permissions?: string[];
      };
      startTime?: number;
      correlationId?: string;
    }
  }