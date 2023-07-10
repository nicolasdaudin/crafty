import { PrismaClient } from '@prisma/client';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';
import { exec } from 'child_process';
import { promisify } from 'util';
import { messageBuilder } from '../../tests/message.builder';
import { PrismaMessageRepository } from '../prisma/message.prisma.repository';
import { Message } from '../../domain/message';
import { NotFoundError } from '@prisma/client/runtime';

const asyncExec = promisify(exec);

jest.setTimeout(15000);

describe("PrismaMessageRepository", () => {
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaClient;



  beforeAll(async () => {
    container = await new PostgreSqlContainer()
      .withDatabase('crafty-test')
      .withUsername('crafty-test')
      .withPassword('crafty-test')
      .withExposedPorts(5432)
      .start()

    const databaseUrl = `postgresql://crafty-test:crafty-test@${container.getHost()}:${container.getMappedPort(5432)}/crafty-test?schema=public`;

    prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    })

    await asyncExec(`DATABASE_URL=${databaseUrl} npx prisma migrate deploy`);

    return prismaClient.$connect();

  })

  afterAll(async () => {
    await container.stop({ timeout: 1000 });
    return prismaClient.$disconnect();

  })

  beforeEach(async () => {
    await prismaClient.message.deleteMany();
    await prismaClient.$executeRawUnsafe('DELETE FROM "User" CASCADE');
  })

  test('save() saves a new message correctly when there are NO other messages in the database', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    const newMessage = messageBuilder()
      .withId('3')
      .withText('Well I am Bob')
      .authoredBy('Bob')
      .publishedAt(new Date('2023-06-27T08:32:00.000Z'))
      .build();


    await messageRepository.save(newMessage);

    const actual = await prismaClient.message.findUniqueOrThrow({ where: { id: '3' } });


    expect(actual).toEqual({
      id: '3',
      text: 'Well I am Bob',
      authorId: 'Bob',
      publishedAt: new Date('2023-06-27T08:32:00.000Z')
    })
  })

  test('save() saves a new message correctly when there are other messages in the database', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    const startingMessages = [
      messageBuilder()
        .withId('test1')
        .withText('hi')
        .authoredBy('Alice')
        .publishedAt(new Date('2023-06-27T08:30:00.000Z'))
        .build(),
      messageBuilder()
        .withId('test2')
        .withText('my name is Alice')
        .authoredBy('Alice')
        .publishedAt(new Date('2023-06-27T08:31:00.000Z'))
        .build()
    ]

    await prismaClient.user.create({ data: { name: 'Alice' } })

    for (const msg of startingMessages) {
      const messageData = msg.data;
      await prismaClient.message.create({
        data: {
          id: messageData.id,
          authorId: messageData.author,
          text: messageData.text,
          publishedAt: messageData.publishedAt
        }
      })
    }

    const newMessage = messageBuilder()
      .withId('3')
      .withText('Well I am Bob')
      .authoredBy('Bob')
      .publishedAt(new Date('2023-06-27T08:32:00.000Z'))
      .build();


    await messageRepository.save(newMessage);

    const actual = await prismaClient.message.findUniqueOrThrow({ where: { id: '3' } });

    expect(actual).toEqual({
      id: '3',
      text: 'Well I am Bob',
      authorId: 'Bob',
      publishedAt: new Date('2023-06-27T08:32:00.000Z')
    })
  })

  test('save() edits a message correctly', async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    const startingMessages = [
      messageBuilder()
        .withId('test1')
        .withText('hi')
        .authoredBy('Alice')
        .publishedAt(new Date('2023-06-27T08:30:00.000Z'))
        .build(),
      messageBuilder()
        .withId('test2')
        .withText('my name is Alice')
        .authoredBy('Alice')
        .publishedAt(new Date('2023-06-27T08:31:00.000Z'))
        .build()
    ]

    await prismaClient.user.create({ data: { name: 'Alice' } })

    for (const msg of startingMessages) {
      const messageData = msg.data;
      await prismaClient.message.create({
        data: {
          id: messageData.id,
          authorId: messageData.author,
          text: messageData.text,
          publishedAt: messageData.publishedAt
        }
      })
    }

    const editMessage = messageBuilder()
      .withId('test2')
      .withText('my first name is Alice')
      .authoredBy('Alice')
      .publishedAt(new Date('2023-06-27T08:31:00.000Z'))
      .build()


    await messageRepository.save(editMessage);

    const actual = await prismaClient.message.findUniqueOrThrow({ where: { id: 'test2' } });


    expect(actual).toEqual({
      id: 'test2',
      text: 'my first name is Alice',
      authorId: 'Alice',
      publishedAt: new Date('2023-06-27T08:31:00.000Z')
    })
  })

  test("getById() returns the message by id", async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    const startingMessages = [
      messageBuilder()
        .withId('test1')
        .withText('hi')
        .authoredBy('Alice')
        .publishedAt(new Date('2023-06-27T08:30:00.000Z'))
        .build(),
      messageBuilder()
        .withId('test2')
        .withText('my name is Alice')
        .authoredBy('Alice')
        .publishedAt(new Date('2023-06-27T08:31:00.000Z'))
        .build()
    ]

    await prismaClient.user.create({ data: { name: 'Alice' } })

    for (const msg of startingMessages) {
      const messageData = msg.data;
      await prismaClient.message.create({
        data: {
          id: messageData.id,
          authorId: messageData.author,
          text: messageData.text,
          publishedAt: messageData.publishedAt
        }
      })
    }

    const aliceMessage = await messageRepository.getById('test1');

    expect(aliceMessage).toEqual(messageBuilder()
      .withId('test1')
      .withText('hi')
      .authoredBy('Alice')
      .publishedAt(new Date('2023-06-27T08:30:00.000Z'))
      .build())

  });

  test("getById() throws an error if the id does not exist", async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    const startingMessages = [
      messageBuilder()
        .withId('test1')
        .withText('hi')
        .authoredBy('Alice')
        .publishedAt(new Date('2023-06-27T08:30:00.000Z'))
        .build(),
      messageBuilder()
        .withId('test2')
        .withText('my name is Alice')
        .authoredBy('Alice')
        .publishedAt(new Date('2023-06-27T08:31:00.000Z'))
        .build()
    ]

    await prismaClient.user.create({ data: { name: 'Alice' } })

    for (const msg of startingMessages) {
      const messageData = msg.data;
      await prismaClient.message.create({
        data: {
          id: messageData.id,
          authorId: messageData.author,
          text: messageData.text,
          publishedAt: messageData.publishedAt
        }
      })
    }

    expect.assertions(1);
    try {
      const aliceMessage = await messageRepository.getById('test3');
    } catch (error) {
      expect(error.name).toBe('NotFoundError')
    }

  });

  test.only("getById() retrieves any message if the id is undefined", async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    const startingMessages = [
      messageBuilder()
        .withId('test1')
        .withText('hi')
        .authoredBy('Alice')
        .publishedAt(new Date('2023-06-27T08:30:00.000Z'))
        .build(),
      messageBuilder()
        .withId('test2')
        .withText('my name is Alice')
        .authoredBy('Alice')
        .publishedAt(new Date('2023-06-27T08:31:00.000Z'))
        .build()
    ]

    await prismaClient.user.create({ data: { name: 'Alice' } })

    for (const msg of startingMessages) {
      const messageData = msg.data;
      await prismaClient.message.create({
        data: {
          id: messageData.id,
          authorId: messageData.author,
          text: messageData.text,
          publishedAt: messageData.publishedAt
        }
      })
    }

    const aliceMessage = await messageRepository.getById(undefined);
    expect(aliceMessage.id).toEqual('test1')

  });

  test("getAllOfUser() returns the message by id", async () => {
    const messageRepository = new PrismaMessageRepository(prismaClient);

    const startingMessages = [
      messageBuilder()
        .withId('test1')
        .withText('hi')
        .authoredBy('Alice')
        .publishedAt(new Date('2023-06-27T08:30:00.000Z'))
        .build(),
      messageBuilder()
        .withId('test2')
        .withText('my name is Alice')
        .authoredBy('Alice')
        .publishedAt(new Date('2023-06-27T08:31:00.000Z'))
        .build(),
      messageBuilder()
        .withId('test3')
        .withText('Hi well I am Bob')
        .authoredBy('Bob')
        .publishedAt(new Date('2023-06-27T08:32:00.000Z'))
        .build()
    ]

    await prismaClient.user.create({ data: { name: 'Alice' } })
    await prismaClient.user.create({ data: { name: 'Bob' } })


    for (const msg of startingMessages) {
      const messageData = msg.data;
      await prismaClient.message.create({
        data: {
          id: messageData.id,
          authorId: messageData.author,
          text: messageData.text,
          publishedAt: messageData.publishedAt
        }
      })
    }

    const aliceMessages = await messageRepository.getAllOfUser('Alice');

    expect(aliceMessages).toHaveLength(2);
    expect(aliceMessages).toEqual(expect.arrayContaining([messageBuilder()
      .withId('test1')
      .withText('hi')
      .authoredBy('Alice')
      .publishedAt(new Date('2023-06-27T08:30:00.000Z'))
      .build(),
    messageBuilder()
      .withId('test2')
      .withText('my name is Alice')
      .authoredBy('Alice')
      .publishedAt(new Date('2023-06-27T08:31:00.000Z'))
      .build()
    ]))

  });


})