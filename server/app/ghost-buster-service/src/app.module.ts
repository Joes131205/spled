import { Module } from '@nestjs/common';
import { GhostBusterModule } from './ghost-buster/ghost-buster.module';

@Module({
  imports: [GhostBusterModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
