import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  // Parameterized by TypeORM: the email is sent to Postgres as a *value*,
  // never glued into the SQL text -> SQL injection is not possible here.
  findByEmail(email: string) {
    return this.repo.findOneBy({ email });
  }

  // Same, but also selects the hidden passwordHash (used only by login).
  findByEmailWithPassword(email: string) {
    return this.repo.findOne({
      where: { email },
      select: { id: true, email: true, passwordHash: true },
    });
  }

  findById(id: string) {
    return this.repo.findOneBy({ id });
  }

  create(email: string, passwordHash: string) {
    return this.repo.save(this.repo.create({ email, passwordHash }));
  }
}
