import type { Request } from 'express';
import type { JwtPayload } from '../../shared/types/user.js';

export interface TenantContext {
  id: string;
  slug: string;
  schemaName: string;
}

export interface AuthenticatedRequest extends Request {
  tenant?: TenantContext;
  user?: JwtPayload;
}
