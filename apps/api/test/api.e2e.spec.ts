import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ApiModule } from '../src/api.module';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';
import { PrismaClient } from '@prisma/client';
import { StubDateProvider } from '@crafty/crafty/infra/stub-data-provider';
import { promisify } from 'util';
import { exec } from 'child_process';
import { DateProvider } from '@crafty/crafty/application/date-provider';
import { PrismaMessageRepository } from '@crafty/crafty/infra/prisma/message.prisma.repository';
import { Message } from '@crafty/crafty/domain/message';
import { messageBuilder } from '@crafty/crafty/tests/message.builder';
import { PrismaFolloweeRepository } from '@crafty/crafty/infra/prisma/followee.prisma.repository';

const asyncExec = promisify(exec);


describe('Api App(e2e)', () => {
  let app: INestApplication;
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaClient;

  const now = new Date('2023-02-14T19:00:00.000Z');
  const justBeforeNow = new Date('2023-02-14T18:59:59.000Z');
  const dateProvider = new StubDateProvider();
  dateProvider.now = now;

  beforeAll(async () => {
    container = await new PostgreSqlContainer()
      .withDatabase('crafty')
      .withUsername('crafty')
      .withPassword('crafty')
      .withExposedPorts(5432)
      .start()

    const databaseUrl = `postgresql://crafty:crafty@${container.getHost()}:${container.getMappedPort(5432)}/crafty?schema=public`;

    prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    })

    await asyncExec(`DATABASE_URL=${databaseUrl} npx prisma migrate deploy`);

    return prismaClient.$connect();

  }, 30000)

  afterAll(async () => {
    await app.close()
    await container.stop({ timeout: 1000 });
    return prismaClient.$disconnect();

  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    })
      .overrideProvider(DateProvider)
      .useValue(dateProvider)
      .overrideProvider(PrismaClient)
      .useValue(prismaClient)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await prismaClient.message.deleteMany();
    await prismaClient.$executeRawUnsafe('DELETE FROM "User" CASCADE');
  });

  test('POST /post', async () => {
    await request(app.getHttpServer())
      .post('/post')
      .send({ user: 'Alice', message: 'Hi from API from Alice' })
      .expect(201)

    const messageRepository = new PrismaMessageRepository(prismaClient);

    const messages = await messageRepository.getAllOfUser('Alice');
    expect(messages[0]).toEqual(Message.fromData({
      id: expect.any(String),
      author: 'Alice',
      text: 'Hi from API from Alice',
      publishedAt: now
    }));
  });

  test('POST /edit', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);
    await messageRepository.save(messageBuilder().withId('e2e-api-id').withText('message from api e2e').build())

    await request(app.getHttpServer())
      .post('/edit')
      .send({ id: 'e2e-api-id', message: 'message from api e2e updated' })
      .expect(200)


    const message = await messageRepository.getById('e2e-api-id');
    expect(message).toEqual(Message.fromData({
      id: 'e2e-api-id',
      author: expect.any(String),
      text: 'message from api e2e updated',
      publishedAt: expect.any(Date)
    }));
  });


  test('GET /view', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    await messageRepository.save(
      messageBuilder()
        .withId('e2e-test-api-view')
        .withText('I am Alice and you are?')
        .publishedAt(now)
        .authoredBy('Alice')
        .build())

    expect.assertions(1);
    await request(app.getHttpServer())
      .get('/view?user=Alice')
      .expect(200)
      .then(response => {
        expect(response.body).toEqual([{
          id: 'e2e-test-api-view',
          author: 'Alice',
          text: 'I am Alice and you are?',
          publishedAt: now.toISOString()
        }])
      })

  });

  test('GET /wall', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);
    const followeeRepository = new PrismaFolloweeRepository(prismaClient);

    await messageRepository.save(
      messageBuilder()
        .withId('e2e-test-wall-1')
        .withText('I am Alice')
        .publishedAt(justBeforeNow)
        .authoredBy('Alice')
        .build())
    await messageRepository.save(
      messageBuilder()
        .withId('e2e-test-wall-2')
        .withText('I am Bob')
        .publishedAt(now)
        .authoredBy('Bob')
        .build())
    await followeeRepository.saveFollowee({ user: 'Alice', followee: 'Bob' })

    expect.assertions(1);
    await request(app.getHttpServer())
      .get('/wall?user=Alice')
      .expect(response => {
        expect(response.body).toEqual([
          {
            id: 'e2e-test-wall-2',
            author: 'Bob',
            text: 'I am Bob',
            publishedAt: now.toISOString()
          }, {
            id: 'e2e-test-wall-1',
            author: 'Alice',
            text: 'I am Alice',
            publishedAt: justBeforeNow.toISOString()
          }
        ])
      })

  });

  test('POST /follow', async () => {
    const followeeRepository = new PrismaFolloweeRepository(prismaClient);


    await request(app.getHttpServer())
      .post('/follow')
      .send({ user: 'Alice', userToFollow: 'Bob' })
      .expect(201)

    const aliceFollowees = await followeeRepository.getFolloweesOf('Alice')

    expect(aliceFollowees).toEqual(['Bob']);

  });
});
