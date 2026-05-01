import { Module } from '@nestjs/common';
import { EvidencesModule } from './evidences/evidences.module';

@Module({
  imports: [EvidencesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}