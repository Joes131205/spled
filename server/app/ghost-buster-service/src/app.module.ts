import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GhostBusterModule } from './ghost-buster/ghost-buster.module';
import { JwtStrategy } from './utils/strategy/jwt.strategy';

@Module({
  imports: [
    GhostBusterModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'jwt-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [],
  providers: [JwtStrategy],
})
export class AppModule {}
