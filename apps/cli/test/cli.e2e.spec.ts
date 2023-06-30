import { TestingModule } from '@nestjs/testing';

import { CliModule } from '../src/cli.module';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';
import { PrismaClient } from '@prisma/client';
import { StubDateProvider } from '@crafty/crafty/infra/stub-data-provider';
import { promisify } from 'util';
import { exec } from 'child_process';
import { CommandTestFactory } from 'nest-commander-testing';
import { DateProvider } from '@crafty/crafty/application/date-provider';
import { PrismaMessageRepository } from '@crafty/crafty/infra/prisma/message.prisma.repository';
import { Message } from '@crafty/crafty/domain/message';
import { messageBuilder } from '@crafty/crafty/tests/message.builder';
import { FolloweeRepository } from '@crafty/crafty/application/followee.repository';
import { PrismaFolloweeRepository } from '@crafty/crafty/infra/prisma/followee.prisma.repository';

const asyncExec = promisify(exec);


describe('Cli App (e2e)', () => {
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaClient;
  let commandInstance: TestingModule;

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
    await container.stop({ timeout: 1000 });
    return prismaClient.$disconnect();

  })

  beforeEach(async () => {
    jest.spyOn(process, 'exit').mockImplementation(() => {
      return undefined as never;
    })

    commandInstance = await CommandTestFactory.createTestingCommand({ imports: [CliModule] })
      .overrideProvider(DateProvider)
      .useValue(dateProvider)
      .overrideProvider(PrismaClient)
      .useValue(prismaClient)
      .compile();

    await prismaClient.message.deleteMany();
    await prismaClient.$executeRawUnsafe('DELETE FROM "User" CASCADE');
  });

  test('command POST', async () => {


    await CommandTestFactory.run(commandInstance, ['post', 'Bob', 'message from CLI']);

    const messageRepository = new PrismaMessageRepository(prismaClient);

    const messages = await messageRepository.getAllOfUser('Bob');
    expect(messages[0]).toEqual(Message.fromData({
      id: expect.any(String),
      author: 'Bob',
      text: 'message from CLI',
      publishedAt: now
    }));

  });

  test('command EDIT', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);
    await messageRepository.save(messageBuilder().withId('e2e-id').withText('message from e2e').build())


    await CommandTestFactory.run(commandInstance, ['edit', 'e2e-id', 'message from e2e updated']);


    const message = await messageRepository.getById('e2e-id');
    expect(message).toEqual(Message.fromData({
      id: 'e2e-id',
      author: expect.any(String),
      text: 'message from e2e updated',
      publishedAt: expect.any(Date)
    }));

  });

  test('command VIEW', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);
    const consoleTable = jest.fn();
    jest.spyOn(console, 'table').mockImplementation(consoleTable)
    await messageRepository.save(
      messageBuilder()
        .withId('e2e-test-view')
        .withText('e2e test view command')
        .publishedAt(now)
        .authoredBy('Alice')
        .build())

    await CommandTestFactory.run(commandInstance, ['view', 'Alice']);

    expect(consoleTable).toHaveBeenCalledWith(
      [{
        author: 'Alice',
        text: 'e2e test view command',
        publicationTime: 'less than a minute ago'
      }]
    );

  });

  test('command WALL', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);
    const followeeRepository = new PrismaFolloweeRepository(prismaClient);

    const consoleTable = jest.fn();
    jest.spyOn(console, 'table').mockImplementation(consoleTable)

    await messageRepository.save(
      messageBuilder()
        .withId('e2e-test-wall')
        .withText('I am Alice')
        .publishedAt(justBeforeNow)
        .authoredBy('Alice')
        .build())
    await messageRepository.save(
      messageBuilder()
        .withId('e2e-test-wall-1')
        .withText('I am Bob')
        .publishedAt(now)
        .authoredBy('Bob')
        .build())
    await followeeRepository.saveFollowee({ user: 'Alice', followee: 'Bob' })


    await CommandTestFactory.run(commandInstance, ['wall', 'Alice']);

    expect(consoleTable).toHaveBeenCalledWith(
      [
        {
          author: 'Bob',
          text: 'I am Bob',
          publicationTime: 'less than a minute ago'
        },
        {
          author: 'Alice',
          text: 'I am Alice',
          publicationTime: 'less than a minute ago'
        }
      ]
    );
  });

  test('command FOLLOW', async () => {
    const followeeRepository = new PrismaFolloweeRepository(prismaClient);



    await CommandTestFactory.run(commandInstance, ['follow', 'Alice', 'Bob']);

    const aliceFollowees = await followeeRepository.getFolloweesOf('Alice')

    expect(aliceFollowees).toEqual(['Bob']);
  });
});
