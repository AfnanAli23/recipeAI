import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

interface JwtPayLoad {
  sub: string;
  email: string;
}

interface RequestWithUser extends Request {
  user: JwtPayLoad;
}

// A Guard runs BEFORE the controller method. Return true = allowed, throw = blocked.
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    // Expect header:  Authorization: Bearer <token>
    const [type, token] = (req.headers.authorization ?? '').split(' ');
    if (type !== 'Bearer' || !token) throw new UnauthorizedException();

    try {
      // verifyAsync checks the signature AND the expiry date.
      req.user = await this.jwt.verifyAsync(token);
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}

// Custom decorator: @UserId() userId: string  ->  the logged-in user's id.
export const UserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    return req.user.sub;

    // return ctx.switchToHttp().getRequest().user.sub as string;
  },
);
