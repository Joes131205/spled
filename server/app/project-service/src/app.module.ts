import { Module } from '@nestjs/common';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { InvitationsModule } from './invitations/invitations.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './utils/strategy/jwt.strategy';

@Module({
  imports: [
    ProjectsModule,
    TasksModule,
    InvitationsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'super-secret-perfectionist-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [],
  providers: [JwtStrategy],
})
export class AppModule {}
