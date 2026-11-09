import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RecipesModule } from './recipes/recipes.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    // Loads .env into process.env and exposes ConfigService everywhere.
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate limiting: max 60 requests / minute / IP by default.
    // (Stricter limits are added per-route with @Throttle.)
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),

    // Database connection. Local Postgres by default, or DATABASE_URL for online Postgres.
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const url = config.get<string>('DATABASE_URL');
        const connection = url
          ? { url, ssl: { rejectUnauthorized: false } } // online DBs require SSL
          : {
              host: config.get<string>('DB_HOST', 'localhost'),
              port: Number(config.get('DB_PORT', 5432)),
              username: config.get<string>('DB_USER', 'postgres'),
              password: config.get<string>('DB_PASSWORD'),
              database: config.get<string>('DB_NAME', 'recipe_app'),
            };

        return {
          type: 'postgres',
          ...connection,
          autoLoadEntities: true, // picks up every TypeOrmModule.forFeature([...]) entity
          // synchronize auto-creates/alters tables from entities. Great for learning,
          // DANGEROUS in production (can drop data) -> use migrations there.
          synchronize: config.get('NODE_ENV') !== 'production',
        };
      },
    }),

    UsersModule,
    AuthModule,
    AiModule,
    RecipesModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }], // apply throttling globally
})
export class AppModule {}
