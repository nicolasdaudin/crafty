import * as path from "path";
import { FileMessageRepository } from "../../infra/message.file.repository";
import { messageBuilder } from "./message.builder";
import * as fs from 'fs';

describe("FileMessageRepository", () => {

  const testFilePath = path.join(__dirname, 'message-test.json');

  beforeEach(async () => {
    await fs.promises.writeFile(testFilePath, JSON.stringify([]));
  })

  test("save() can save a message in the filesystem", async () => {
    const fileRepo = new FileMessageRepository(testFilePath);

    await fileRepo.save(
      messageBuilder()
        .withId('message-id-1')
        .authoredBy('Alice')
        .withText('Hello there')
        .publishedAt(new Date('2023-06-19T12:33:00Z'))
        .build());

    const messagesData = await fs.promises.readFile(testFilePath);
    const messagesJSON = JSON.parse(messagesData.toString());

    expect(messagesJSON).toEqual([{
      id: 'message-id-1',
      author: 'Alice',
      text: 'Hello there',
      publishedAt: '2023-06-19T12:33:00.000Z'
    }])
  })

  test("save() can edit an existing a message in the filesystem", async () => {

    await fs.promises.writeFile(testFilePath, JSON.stringify([{
      id: 'message-id-1',
      author: 'Alice',
      text: 'Hello there',
      publishedAt: '2023-06-19T12:33:00.000Z'
    }]));

    const fileRepo = new FileMessageRepository(testFilePath);

    await fileRepo.save(
      messageBuilder()
        .withId('message-id-1')
        .authoredBy('Alice')
        .withText('Hello there edited')
        .publishedAt(new Date('2023-06-19T12:33:00Z'))
        .build());

    const messagesData = await fs.promises.readFile(testFilePath);
    const messagesJSON = JSON.parse(messagesData.toString());

    expect(messagesJSON).toEqual([{
      id: 'message-id-1',
      author: 'Alice',
      text: 'Hello there edited',
      publishedAt: '2023-06-19T12:33:00.000Z'
    }])
  })

  test("getById() returns a message by its id", async () => {
    await fs.promises.writeFile(testFilePath, JSON.stringify([{
      id: 'message-id-1',
      author: 'Alice',
      text: 'Hello there',
      publishedAt: '2023-06-19T12:37:00.000Z'
    }, {
      id: 'message-id-2',
      author: 'Bob',
      text: `Hi! I'm Bob and you`,
      publishedAt: '2023-06-19T12:37:00.000Z'
    }]));

    const fileRepo = new FileMessageRepository(testFilePath);

    const message = await fileRepo.getById('message-id-1');


    expect(message).toEqual(
      messageBuilder()
        .withId('message-id-1')
        .authoredBy('Alice')
        .withText('Hello there')
        .publishedAt(new Date('2023-06-19T12:37:00.000Z'))
        .build()
    )
  });

  test("getAllOfUser() only returns messages of that user", async () => {
    await fs.promises.writeFile(testFilePath, JSON.stringify([{
      id: 'message-id-1',
      author: 'Alice',
      text: 'Hello there',
      publishedAt: '2023-06-19T12:37:00.000Z'
    }, {
      id: 'message-id-2',
      author: 'Bob',
      text: `Hi! I'm Bob and you`,
      publishedAt: '2023-06-19T12:37:10.000Z'
    },
    {
      id: 'message-id-3',
      author: 'Alice',
      text: `Well my name is Alice`,
      publishedAt: '2023-06-19T12:37:20.000Z'
    }]));

    const fileRepo = new FileMessageRepository(testFilePath);

    const messages = await fileRepo.getAllOfUser('Alice');


    expect(messages).toEqual([
      messageBuilder()
        .withId('message-id-1')
        .authoredBy('Alice')
        .withText('Hello there')
        .publishedAt(new Date('2023-06-19T12:37:00.000Z'))
        .build()
      ,
      messageBuilder()
        .withId('message-id-3')
        .authoredBy('Alice')
        .withText('Well my name is Alice')
        .publishedAt(new Date('2023-06-19T12:37:20.000Z'))
        .build()]
    );
  });
})