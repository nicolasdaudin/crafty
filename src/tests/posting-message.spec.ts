import { text } from "stream/consumers";
import { DateProvider, Message, MessageEmptyError, MessageRepository, MessageTooLongError, PostMessageCommand, PostMessageUseCase } from "../post-message.usecase";

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

    test("Alice cannot post a message of 281 characters", () => {
      const textWithLengthOf281 = 'a'.repeat(281);
      givenNowIs(new Date('2023-06-08T12:51:00Z'))

      whenUserPostsAMessage({ id: 'message-id', text: textWithLengthOf281, author: 'Alice' });

      thenErrorShouldBe(MessageTooLongError);
    })
  });

  describe('Rule: A message cannot be empty', () => {

    test("Alice cannot post an empty message", () => {
      const emptyText = '';
      givenNowIs(new Date('2023-06-08T12:51:00Z'))

      whenUserPostsAMessage({ id: 'message-id', text: emptyText, author: 'Alice' });

      thenErrorShouldBe(MessageEmptyError);
    })

  });
})




let message: Message | null;
let thrownError: Error;

class InMemoryMessageRepository implements MessageRepository {
  save(msg: Message | null): void {
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
  try {
    postMessageUseCase.handle(postMessageCommand)
  } catch (error) {
    thrownError = error;
  }

}

function thenPostedMessageShouldBe(expected: Message | null) {
  expect(expected).toEqual(message)
}


function thenErrorShouldBe(expectedErrorClass: new () => Error) {
  expect(thrownError).toBeInstanceOf(expectedErrorClass);
}

