import { MessageEmptyError, MessageTooLongError } from "../../post-message.usecase";
import { messageBuilder } from "./message.builder";
import { MessagingFixture, createMessagingFixture } from "./message.fixture";

describe('Feature: Posting a message', () => {
  let fixture: MessagingFixture;
  const aliceMessageBuilder = messageBuilder().withId('message-id').authoredBy('Alice');
  beforeEach(() => {
    fixture = createMessagingFixture();
  })
  describe('Rule: A message can contain a maximum of 280 characters', () => {
    test("Alice can post a message on her timeline", async () => {
      fixture.givenNowIs(new Date('2023-06-08T12:51:00Z'));


      await fixture.whenUserPostsAMessage(
        aliceMessageBuilder
          .withText('Hello World')
          .build()
      );

      fixture.thenPostedMessageShouldBe(
        aliceMessageBuilder
          .withText('Hello World')
          .publishedAt(new Date('2023-06-08T12:51:00Z'))
          .build()
      )
    })



    test("Alice can post a message of 280 characters", async () => {
      const textWithLengthOf280 = 'a'.repeat(280);
      fixture.givenNowIs(new Date('2023-06-08T12:51:00Z'))

      await fixture.whenUserPostsAMessage(
        aliceMessageBuilder.withText(textWithLengthOf280).build())

      fixture.thenPostedMessageShouldBe(aliceMessageBuilder.withText(textWithLengthOf280).publishedAt(new Date('2023-06-08T12:51:00Z')).build());

    })


    test("Alice cannot post a message of 281 characters", async () => {
      const textWithLengthOf281 = 'a'.repeat(281);
      fixture.givenNowIs(new Date('2023-06-08T12:51:00Z'))

      await fixture.whenUserPostsAMessage(aliceMessageBuilder.withText(textWithLengthOf281).build());

      fixture.thenErrorShouldBe(MessageTooLongError);
    })
  })


  describe('Rule: A message cannot be empty', () => {

    test("Alice cannot post an empty message", async () => {

      fixture.givenNowIs(new Date('2023-06-08T12:51:00Z'))

      await fixture.whenUserPostsAMessage(aliceMessageBuilder.withText('').build())

      fixture.thenErrorShouldBe(MessageEmptyError);
    })

    test("Alice cannot post a message with only whitespaces", async () => {
      const emptyText = '';
      fixture.givenNowIs(new Date('2023-06-08T12:51:00Z'))

      await fixture.whenUserPostsAMessage(aliceMessageBuilder.withText('      ').build());

      fixture.thenErrorShouldBe(MessageEmptyError);
    })

  })
})


