import { MessageEmptyError, MessageTooLongError } from "../domain/message";
import { messageBuilder } from "./message.builder";
import { MessagingFixture, createMessagingFixture } from "./message.fixture";

describe("Feature : Edit a message", () => {
  let fixture: MessagingFixture;
  beforeEach(() => {
    fixture = createMessagingFixture();
  })

  describe("Rule: the new message can not be more than 280 characters", () => {
    test("Alice edits a message with a new message of 280 characters')", async () => {
      const messageByAlice = messageBuilder().withId('message-id').authoredBy('Alice');
      const message = messageByAlice.withText('Hello Wrld').build();
      fixture.givenFollowingMessagesExist([message]);



      await fixture.whenUserEditsMessage({
        id: 'message-id',
        text: 'Hello World',
      });

      fixture.thenPostedMessageShouldBe(messageByAlice.withText('Hello World').build());
    })

    test("Alice edits her message, not Bob's message", async () => {
      const messageBuilderByAlice = messageBuilder().withId('message-id-alice').authoredBy('Alice').withText('Hello Wrld');
      const messageByAlice = messageBuilderByAlice.build();
      const messageBuilderByBob = messageBuilder().withId('message-id-bob').authoredBy('Bob').withText(`I'm Bob, what's your name?`)
      const messageByBob = messageBuilderByBob.build();
      fixture.givenFollowingMessagesExist([messageByAlice, messageByBob]);



      await fixture.whenUserEditsMessage({
        id: 'message-id-alice',
        text: 'Hello World',
      });

      fixture.thenPostedMessageShouldBe(messageBuilderByAlice.withText('Hello World').build());
      fixture.thenPostedMessageShouldBe(messageBuilderByBob.build());
    })

    test("Alice can not edit a message with a new message of 281 characters')", async () => {
      const messageByAlice = messageBuilder().withId('message-id').authoredBy('Alice');
      const textWithLengthOf281 = 'a'.repeat(281)
      const message = messageByAlice.withText('Hello World').build();
      fixture.givenFollowingMessagesExist([message]);



      await fixture.whenUserEditsMessage({
        id: 'message-id',
        text: textWithLengthOf281,
      });

      fixture.thenPostedMessageShouldBe(messageByAlice.withText('Hello World').build());
      fixture.thenErrorShouldBe(MessageTooLongError);
    })
  })

  describe('Rule: A message cannot be empty', () => {

    test("Alice cannot edit with an empty message", async () => {

      const messageByAlice = messageBuilder().withId('message-id').authoredBy('Alice');
      const message = messageByAlice.withText('Hello World').build();

      fixture.givenFollowingMessagesExist([message]);


      await fixture.whenUserEditsMessage({
        id: 'message-id',
        text: '',
      });

      fixture.thenPostedMessageShouldBe(messageByAlice.withText('Hello World').build());
      fixture.thenErrorShouldBe(MessageEmptyError);
    })

    test("Alice cannot edit with a message with only whitespaces", async () => {
      const messageByAlice = messageBuilder().withId('message-id').authoredBy('Alice');
      const message = messageByAlice.withText('Hello World').build();

      fixture.givenFollowingMessagesExist([message]);


      await fixture.whenUserEditsMessage({
        id: 'message-id',
        text: '   ',
      });

      fixture.thenPostedMessageShouldBe(messageByAlice.withText('Hello World').build());
      fixture.thenErrorShouldBe(MessageEmptyError);
    })
  })
});