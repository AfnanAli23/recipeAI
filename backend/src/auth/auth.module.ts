import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      global: true, // JwtService can be injected anywhere (the guard needs it in RecipesModule)
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        // getOrThrow => the app refuses to start without a secret (fail fast!)
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: 60 * 60 * 24 * 7 }, // 7 days, in seconds
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
