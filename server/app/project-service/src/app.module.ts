import { Module } from '@nestjs/common';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { EvidencesModule } from './evidences/evidences.module';

@Module({
  imports: [ProjectsModule, TasksModule, EvidencesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}