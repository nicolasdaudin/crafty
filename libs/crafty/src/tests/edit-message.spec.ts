import { MessageEmptyError, MessageTooLongError } from "../domain/message";
import { messageBuilder } from "./message.builder";
import { MessagingFixture, createMessagingFixture } from "./message.fixture";

describe("Feature : Edit a message", () => {
  let fixture: MessagingFixture;
  beforeEach(() => {
    fixture = createMessagingFixture();
  })

  describe("Rule: a user only edits one message at a time by specifying the correct id", () => {
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

    test("Bob edits his message, not Alice's message", async () => {
      const messageBuilderByAlice = messageBuilder().withId('message-id-alice').authoredBy('Alice').withText('Hello I am Alice');
      const messageByAlice = messageBuilderByAlice.build();
      const messageBuilderByBob = messageBuilder().withId('message-id-bob').authoredBy('Bob').withText(`Hello I am Bobby`)
      const messageByBob = messageBuilderByBob.build();
      fixture.givenFollowingMessagesExist([messageByAlice, messageByBob]);



      await fixture.whenUserEditsMessage({
        id: 'message-id-bob',
        text: 'Hello I am Bob',
      });

      fixture.thenPostedMessageShouldBe(messageBuilderByAlice.withText('Hello I am Alice').build());
      fixture.thenPostedMessageShouldBe(messageBuilderByBob.withText('Hello I am Bob').build());
    })

    test("Alice tries to edit a message with a wrong id and no messages are edited", async () => {
      const messages = [
        messageBuilder()
          .withId('8012')
          .authoredBy('Bob')
          .withText('Hello I am Bob')
          .publishedAt(new Date('2023-06-29T11:10:00.073Z'))
          .build(),
        messageBuilder()
          .withId('2311')
          .authoredBy('Bob')
          .withText(`How are you?`)
          .publishedAt(new Date('2023-06-28T07:18:01.670Z'))
          .build(),
        messageBuilder()
          .withId('2468')
          .authoredBy('Alice')
          .withText('Hello I am Alice')
          .publishedAt(new Date('2023-07-03T14:34:43.925Z'))
          .build(),
        messageBuilder()
          .withId('8008')
          .authoredBy('Alice')
          .withText('I am fine and you?')
          .publishedAt(new Date('2023-06-28T07:15:59.239Z'))
          .build()
      ]

      fixture.givenFollowingMessagesExist(messages);

      await fixture.whenUserEditsMessage({
        id: '934',
        text: 'edited_message',
      });

      fixture.thenPostedMessageShouldBe(messages[0])
      fixture.thenPostedMessageShouldBe(messages[1])
      fixture.thenPostedMessageShouldBe(messages[2])
      fixture.thenPostedMessageShouldBe(messages[3])

    })
  });

  describe("Rule: the new message can not be more than 280 characters", () => {
    test("Alice successfully edits a message with a new message of less than 280 characters')", async () => {
      const messageByAlice = messageBuilder().withId('message-id').authoredBy('Alice');
      const message = messageByAlice.withText('Hello Wrld').build();
      fixture.givenFollowingMessagesExist([message]);



      await fixture.whenUserEditsMessage({
        id: 'message-id',
        text: 'Hello World',
      });

      fixture.thenPostedMessageShouldBe(messageByAlice.withText('Hello World').build());
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