import { Message, MessageEmptyError, MessageTooLongError, PostMessageCommand, PostMessageUseCase } from "../post-message.usecase";
import { InMemoryMessageRepository } from "../message.inmemory.repository";
import { StubDateProvider } from "../stub-data-provider";

describe('Feature: Posting a message', () => {
  let fixture: Fixture;
  beforeEach(() => {
    fixture = createFixture();
  })
  describe('Rule: A message can contain a maximum of 280 characters', () => {
    test("Alice can post a message on her timeline", async () => {
      fixture.givenNowIs(new Date('2023-06-08T12:51:00Z'));

      await fixture.whenUserPostsAMessage({
        id: 'message-id', text: 'Hello World', author: 'Alice'
      });

      fixture.thenPostedMessageShouldBe({
        id: 'message-id', text: 'Hello World', author: 'Alice',
        publishedAt: new Date('2023-06-08T12:51:00Z')
      })

    })

    test("Alice can post a message of 280 characters", async () => {
      const textWithLengthOf280 = 'a'.repeat(280);
      fixture.givenNowIs(new Date('2023-06-08T12:51:00Z'))

      await fixture.whenUserPostsAMessage({ id: 'message-id', text: textWithLengthOf280, author: 'Alice' });

      fixture.thenPostedMessageShouldBe({
        id: 'message-id', text: textWithLengthOf280, author: 'Alice',
        publishedAt: new Date('2023-06-08T12:51:00Z')
      })
    })

    test("Alice cannot post a message of 281 characters", async () => {
      const textWithLengthOf281 = 'a'.repeat(281);
      fixture.givenNowIs(new Date('2023-06-08T12:51:00Z'))

      await fixture.whenUserPostsAMessage({ id: 'message-id', text: textWithLengthOf281, author: 'Alice' });

      fixture.thenErrorShouldBe(MessageTooLongError);
    })
  });

  describe('Rule: A message cannot be empty', () => {

    test("Alice cannot post an empty message", async () => {

      fixture.givenNowIs(new Date('2023-06-08T12:51:00Z'))

      await fixture.whenUserPostsAMessage({ id: 'message-id', text: '', author: 'Alice' });

      fixture.thenErrorShouldBe(MessageEmptyError);
    })

    test("Alice cannot post a message with only whitespaces", async () => {
      const emptyText = '';
      fixture.givenNowIs(new Date('2023-06-08T12:51:00Z'))

      await fixture.whenUserPostsAMessage({ id: 'message-id', text: '    ', author: 'Alice' });

      fixture.thenErrorShouldBe(MessageEmptyError);
    })

  });
})





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
    async whenUserPostsAMessage(postMessageCommand: PostMessageCommand) {
      try {
        await postMessageUseCase.handle(postMessageCommand)
      } catch (error) {
        thrownError = error;
      }
    },
    thenPostedMessageShouldBe(expected: Message) {
      expect(expected).toEqual(messageRepository.getMessageById(expected.id))
    },
    thenErrorShouldBe(expectedErrorClass: new () => Error) {
      expect(thrownError).toBeInstanceOf(expectedErrorClass);
    }
  }
}

type Fixture = ReturnType<typeof createFixture>
