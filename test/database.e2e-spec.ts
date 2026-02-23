import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('Database Connection (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be connected to the database', () => {
    expect(dataSource).toBeDefined();
    expect(dataSource.isInitialized).toBe(true);
  });

  it('should be able to run a simple query', async () => {
    const result = await dataSource.query('SELECT 1 as result');
    expect(result).toBeDefined();
    expect(result[0].result).toBe(1);
  });
});
