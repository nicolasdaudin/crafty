import { messageBuilder } from "./message.builder";
import { MessagingFixture, createMessagingFixture } from "./message.fixture";

describe('Feature: View a timeline', () => {
  let fixture: MessagingFixture;
  beforeEach(() => {
    fixture = createMessagingFixture();
  })
  describe('Rule: Messages are in reverse chronological order', () => {
    test("Alice can see her timeline with messages in reverse order", async () => {
      fixture.givenFollowingMessagesExist([
        messageBuilder().withId('message-1').authoredBy('Alice').withText('Hello there').publishedAt(new Date('2023-06-08T12:50:00Z')).build(),
        messageBuilder().withId('message-2').authoredBy('Bob').withText('Hey guys whats up??').publishedAt(new Date('2023-06-08T12:51:00Z')).build(),
        messageBuilder().withId('message-3').authoredBy('Alice').withText('How are you?').publishedAt(new Date('2023-06-08T12:52:00Z')).build(),
        messageBuilder().withId('message-4').authoredBy('Alice').withText('Anybody?').publishedAt(new Date('2023-06-08T12:52:30Z')).build(),
      ])
      fixture.givenNowIs(new Date('2023-06-08T12:53:00Z'))

      await fixture.whenUserViewTimelineOf('Alice');

      fixture.thenUserShouldSee([
        { author: 'Alice', text: 'Anybody?', publicationTime: 'less than a minute ago' },
        { author: 'Alice', text: 'How are you?', publicationTime: '1 minute ago' },
        { author: 'Alice', text: 'Hello there', publicationTime: '3 minutes ago' },
      ]);
    });

    test("Alice can see an empty timeline", async () => {
      fixture.givenFollowingMessagesExist([])

      await fixture.whenUserViewTimelineOf('Alice');

      fixture.thenUserShouldSee([]);
    });
  })

  describe("Rule: Timeline can only display 5 messages", () => {
    test("Alice can see the last 5 messages out of a timeline of 6 messages", async () => {
      const messages = [1, 2, 3, 4, 5, 6].map(n =>
        messageBuilder().withId(`message-id-${n}`).authoredBy('Alice').withText(`message ${n}`).publishedAt(new Date(`2023-06-08T12:5${n}:00Z`)).build()
      )
      fixture.givenFollowingMessagesExist(messages);

      await fixture.givenNowIs(new Date('2023-06-08T12:57:00Z'))

      await fixture.whenUserViewTimelineOf('Alice');

      fixture.thenUserShouldSee([
        { text: 'message 6', author: 'Alice', publicationTime: '1 minute ago' },
        { text: 'message 5', author: 'Alice', publicationTime: '2 minutes ago' },
        { text: 'message 4', author: 'Alice', publicationTime: '3 minutes ago' },
        { text: 'message 3', author: 'Alice', publicationTime: '4 minutes ago' },
        { text: 'message 2', author: 'Alice', publicationTime: '5 minutes ago' },
      ]);
    })
  })

  describe("Rule: An author can only see his messages", () => {
    test("Alice can see her messages but not Bob's messages", async () => {
      fixture.givenFollowingMessagesExist([
        messageBuilder().withId('message-id-1').authoredBy('Alice').withText('message 1').publishedAt(new Date('2023-06-08T12:50:00Z')).build(),
        messageBuilder().withId('message-id-2').authoredBy('Bob').withText('message 2').publishedAt(new Date('2023-06-08T12:53:00Z')).build(),
      ])

      fixture.givenNowIs(new Date('2023-06-08T12:54:00Z'))

      await fixture.whenUserViewTimelineOf('Alice');

      fixture.thenUserShouldSee([
        { text: 'message 1', author: 'Alice', publicationTime: '4 minutes ago' }
      ]);
    })
  })
})








