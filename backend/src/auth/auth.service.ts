import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (await this.users.findByEmail(dto.email)) {
      throw new ConflictException('Email is already registered');
    }
    // Never store plain passwords. bcrypt = slow, salted hash (12 rounds).
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.users.create(dto.email, passwordHash);
    return this.issueToken(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmailWithPassword(dto.email);
    // Same error for "no such user" and "wrong password" -> attackers can't
    // use the response to discover which emails exist.
    const ok = user && (await bcrypt.compare(dto.password, user.passwordHash));
    if (!user || !ok)
      throw new UnauthorizedException('Invalid email or password');
    return this.issueToken(user.id, user.email);
  }

  // JWT = signed JSON ("sub" = subject = user id). The server stores nothing:
  // it just verifies the signature on every request (stateless auth).
  private async issueToken(id: string, email: string) {
    const accessToken = await this.jwt.signAsync({ sub: id, email });
    return { accessToken, user: { id, email } };
  }
}
