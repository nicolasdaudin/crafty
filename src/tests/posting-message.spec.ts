import { DateProvider, Message, MessageRepository, PostMessageCommand, PostMessageUseCase } from "../post-message.usecase";

describe('Feature: Posting a message', () => {
  describe('Rule: A message can contain a maximum of 280 characters', () => {
    test("Alice can post a message on her timeline", () => {
      givenNowIs(new Date('2023-06-08T12:51:00Z'));

      whenUserPostsAMessage({
        id: 'message-id', text: 'Hello World', author: 'Alice'
      });

      thenPostedMessageShouldBe({
        id: 'message-id', text: 'Hello World', author: 'Alice',
        publishedAt: new Date('2023-06-08T12:51:00Z')
      })

    })
  })
})




let message: Message;

class InMemoryMessageRepository implements MessageRepository {
  save(msg: Message): void {
    message = msg;
  }
}
class StubDateProvider implements DateProvider {
  now: Date
  getNow(): Date {
    return this.now;
  }
}

const messageRepository = new InMemoryMessageRepository();
const dateProvider = new StubDateProvider();

const postMessageUseCase = new PostMessageUseCase(
  messageRepository,
  dateProvider
);

function givenNowIs(_now: Date) {
  dateProvider.now = _now;
}

function whenUserPostsAMessage(postMessageCommand: PostMessageCommand) {
  postMessageUseCase.handle(postMessageCommand)

}

function thenPostedMessageShouldBe(expected: Message) {
  expect(expected).toEqual(message)
}

