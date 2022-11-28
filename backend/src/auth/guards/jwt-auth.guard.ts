import { Observable } from 'rxjs';
import { AuthGuard } from '@nestjs/passport';
import {
  BadRequestException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly role?: string) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const ca = super.canActivate(context) as any;
      const caType = typeof ca;
      if (caType === 'boolean') {
        const allowed = ca as boolean;
        if (allowed) {
          resolve(this.validateRequest(context));
        } else {
          resolve(false);
        }
      } else if (caType === 'object') {
        if (typeof ca.then === 'function') {
          (ca as Promise<boolean>)
            .then((allowed) => {
              if (allowed) {
                resolve(this.validateRequest(context));
              } else {
                resolve(false);
              }
            })
            .catch((r) => {
              reject(r);
            });
        } else if (typeof ca.pipe === 'function') {
          const subscription = (ca as Observable<boolean>).subscribe({
            next: (allowed) => {
              if (allowed) {
                resolve(this.validateRequest(context));
              } else {
                resolve(false);
              }
            },
            error: (error) => reject(error),
            complete: () => subscription.unsubscribe(),
          });
        }
      }
    });
  }

  validateRequest(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (!request || !request.user || !request.user.role) {
      throw new BadRequestException('Role is missing');
    }
    return !this.role || request.user.role === this.role;
  }
}
