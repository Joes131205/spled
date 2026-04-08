import { Module } from '@nestjs/common';
import { GhostBusterController } from './ghost-buster.controller';
import { GhostBusterService } from './ghost-buster.service';

@Module({
  controllers: [GhostBusterController],
  providers: [GhostBusterService],
})
export class GhostBusterModule {}
