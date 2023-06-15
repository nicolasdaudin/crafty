import { text } from "stream/consumers";
import { DateProvider, Message, MessageEmptyError, MessageRepository, MessageTooLongError, PostMessageCommand, PostMessageUseCase } from "../post-message.usecase";

describe('Feature: Posting a message', () => {
  let fixture: Fixture;
  beforeEach(() => {
    fixture = createFixture();
  })
  describe('Rule: A message can contain a maximum of 280 characters', () => {
    test("Alice can post a message on her timeline", () => {
      fixture.givenNowIs(new Date('2023-06-08T12:51:00Z'));

      fixture.whenUserPostsAMessage({
        id: 'message-id', text: 'Hello World', author: 'Alice'
      });

      fixture.thenPostedMessageShouldBe({
        id: 'message-id', text: 'Hello World', author: 'Alice',
        publishedAt: new Date('2023-06-08T12:51:00Z')
      })

    })

    test("Alice can post a message of 280 characters", () => {
      const textWithLengthOf280 = 'a'.repeat(280);
      fixture.givenNowIs(new Date('2023-06-08T12:51:00Z'))

      fixture.whenUserPostsAMessage({ id: 'message-id', text: textWithLengthOf280, author: 'Alice' });

      fixture.thenPostedMessageShouldBe({
        id: 'message-id', text: textWithLengthOf280, author: 'Alice',
        publishedAt: new Date('2023-06-08T12:51:00Z')
      })
    })

    test("Alice cannot post a message of 281 characters", () => {
      const textWithLengthOf281 = 'a'.repeat(281);
      fixture.givenNowIs(new Date('2023-06-08T12:51:00Z'))

      fixture.whenUserPostsAMessage({ id: 'message-id', text: textWithLengthOf281, author: 'Alice' });

      fixture.thenErrorShouldBe(MessageTooLongError);
    })
  });

  describe('Rule: A message cannot be empty', () => {

    test("Alice cannot post an empty message", () => {

      fixture.givenNowIs(new Date('2023-06-08T12:51:00Z'))

      fixture.whenUserPostsAMessage({ id: 'message-id', text: '', author: 'Alice' });

      fixture.thenErrorShouldBe(MessageEmptyError);
    })

    test("Alice cannot post a message with only whitespaces", () => {
      const emptyText = '';
      fixture.givenNowIs(new Date('2023-06-08T12:51:00Z'))

      fixture.whenUserPostsAMessage({ id: 'message-id', text: '    ', author: 'Alice' });

      fixture.thenErrorShouldBe(MessageEmptyError);
    })

  });
})





class InMemoryMessageRepository implements MessageRepository {
  message: Message;
  save(msg: Message): void {
    this.message = msg;
  }
}
class StubDateProvider implements DateProvider {
  now: Date
  getNow(): Date {
    return this.now;
  }
}



const createFixture = () => {
  const messageRepository = new InMemoryMessageRepository();
  const dateProvider = new StubDateProvider();
  const postMessageUseCase = new PostMessageUseCase(
    messageRepository,
    dateProvider
  );


  let thrownError: Error;

  return {
    givenNowIs(_now: Date) {
      dateProvider.now = _now;
    },
    whenUserPostsAMessage(postMessageCommand: PostMessageCommand) {
      try {
        postMessageUseCase.handle(postMessageCommand)
      } catch (error) {
        thrownError = error;
      }
    },
    thenPostedMessageShouldBe(expected: Message) {
      expect(expected).toEqual(messageRepository.message)
    },
    thenErrorShouldBe(expectedErrorClass: new () => Error) {
      expect(thrownError).toBeInstanceOf(expectedErrorClass);
    }
  }
}

type Fixture = ReturnType<typeof createFixture>
