import { PrismaClient } from "@prisma/client";
import { exec } from "child_process";
import { PostgreSqlContainer, StartedPostgreSqlContainer } from "testcontainers";
import { promisify } from "util";
import { PrismaFolloweeRepository } from "../prisma/followee.prisma.repository";
import { Followee } from "../../application/followee.repository";

const asyncExec = promisify(exec);

jest.setTimeout(15000);


describe('PrismaFolloweeRepository', () => {
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaClient;

  beforeAll(async () => {
    container = await new PostgreSqlContainer()
      .withDatabase('crafty-test')
      .withUsername('crafty-test')
      .withPassword('crafty-test')
      .withExposedPorts(5432)
      .start();

    const databaseUrl = `postgresql://crafty-test:crafty-test@${container.getHost()}:${container.getMappedPort(5432)}/crafty-test?schema=public`

    prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    })
    await asyncExec(`DATABASE_URL=${databaseUrl} npx prisma migrate deploy`);

    return prismaClient.$connect()



  });

  afterAll(async () => {
    await container.stop({ timeout: 1000 });
    return prismaClient.$disconnect();
  })

  beforeEach(async () => {
    await prismaClient.message.deleteMany();
    await prismaClient.$executeRawUnsafe('DELETE FROM "User" CASCADE');
  })

  test('saveFollowee() saves a new followee to a non-existent user', async () => {
    const followeeRepository = new PrismaFolloweeRepository(prismaClient);

    const newFollowee: Followee = { user: 'Alice', followee: 'Bob' };

    await followeeRepository.saveFollowee(newFollowee);

    const followees = await prismaClient.user.findFirstOrThrow({
      where: { name: 'Alice' },
      include: { following: true }
    });

    expect(followees).toEqual(expect.objectContaining(
      {
        name: 'Alice',
        following: [expect.objectContaining({ name: 'Bob' })]
      })
    )

  });

  test('saveFollowee() saves a new followee to an already existing user', async () => {
    const followeeRepository = new PrismaFolloweeRepository(prismaClient);
    await prismaClient.user.create({
      data: {
        name: 'Alice',
        following: {
          create: {
            name: 'Charlie'
          }
        }
      }
    });


    const newFollowee: Followee = { user: 'Alice', followee: 'Bob' };

    await followeeRepository.saveFollowee(newFollowee);

    const followees = await prismaClient.user.findFirstOrThrow({
      where: { name: 'Alice' },
      include: { following: true }
    });
    expect(followees).toEqual(expect.objectContaining(
      {
        name: 'Alice',
        following: expect.arrayContaining([
          expect.objectContaining({ name: 'Bob' }),
          expect.objectContaining({ name: 'Charlie' })
        ])
      })
    )
  });

  test('getFolloweesOf() returns a list of followees for that user', async () => {
    const followeeRepository = new PrismaFolloweeRepository(prismaClient);
    await prismaClient.user.create({
      data: {
        name: 'Alice',
        following: {
          create: {
            name: 'Charlie'
          }
        }
      }
    });

    const actualFollowees = await followeeRepository.getFolloweesOf('Alice');

    expect(actualFollowees).toEqual(['Charlie']);
  });

  test('getFolloweesOf() returns an empty array of followees if there are no followees for that user', async () => {
    const followeeRepository = new PrismaFolloweeRepository(prismaClient);
    await prismaClient.user.create({
      data: {
        name: 'Alice'
      }
    });

    const actualFollowees = await followeeRepository.getFolloweesOf('Alice');

    expect(actualFollowees).toEqual([]);
  })

  test('getFolloweesOf() returns an empty list of followees if the user does not exist', async () => {
    const followeeRepository = new PrismaFolloweeRepository(prismaClient);
    try {
      expect.assertions(1);
      const actualFollowees = await followeeRepository.getFolloweesOf('Alice');

    } catch (error) {

      expect(error.name).toEqual('NotFoundError');
    }
  })

})