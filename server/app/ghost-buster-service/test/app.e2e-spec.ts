import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('GhostBusterService (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ghost-buster/:projectId (GET)', () => {
    return request(app.getHttpServer())
      .get('/ghost-buster/default-project')
      .expect(200)
      .expect({
        projectId: 'default-project',
        inactivityThreshold: 'H-3',
        flaggedMembers: ['member-a', 'member-b'],
      });
  });
});
