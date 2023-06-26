import { MessagingFixture, createMessagingFixture } from "../../messaging/tests/message.fixture";
import { messageBuilder } from "../../messaging/tests/message.builder";
import { FollowingFixture, createFollowingFixture } from "../../followee/tests/followee.fixture";
import { ViewWallUseCase } from "../view-wall.usecase";
import { InMemoryMessageRepository } from "../../messaging/infra/message.inmemory.repository";
import { StubDateProvider } from "../../messaging/infra/stub-data-provider";
import { MessageRepository } from "../../messaging/application/message.repository";
import { DateProvider } from "../../messaging/application/date-provider";
import { FolloweeRepository } from "../../followee/followee.repository";
import { InMemoryFolloweeRepository } from "../../followee/infra/followee.inmemory.repository";

describe("Feature: A user can view a wall with an aggregated timeline of his messages and his subscription's messages, in reverse chronological order", () => {

  let fixture: Fixture;
  let messagingFixture: MessagingFixture;
  let followeeFixture: FollowingFixture;

  beforeEach(() => {
    messagingFixture = createMessagingFixture();
    followeeFixture = createFollowingFixture();
    fixture = createFixture({
      messageRepository: messagingFixture.messageRepository,
      followeeRepository: followeeFixture.followeeRepository
    });
  })

  describe("Rule: A user can view his messages and his subscription' messages in reverse chronological order", () => {
    test("Alice has subscribed to Bob. She can see her wall with her messages and Bob's messages", async () => {
      messagingFixture.givenFollowingMessagesExist([
        // TODO: doesn't work if we remove withId ... why ? 
        messageBuilder()
          .withId('1')
          .authoredBy('Alice')
          .withText('Hi my name is Alice')
          .publishedAt(new Date('2023-06-21T13:07:00.000Z'))
          .build(),
        messageBuilder()
          .withId('2')
          .authoredBy('Bob')
          .withText('Hi my name is Bob')
          .publishedAt(new Date('2023-06-21T13:08:30.000Z'))
          .build(),
        messageBuilder()
          .withId('3')
          .authoredBy('Charlie')
          .withText('Nice to meet you! My name is Charlie')
          .publishedAt(new Date('2023-06-21T13:09:00.000Z'))
          .build()
      ]);

      await followeeFixture.givenUserFollowees({
        user: "Alice",
        followees: ["Bob"]
      });

      fixture.givenNowIs(new Date('2023-06-21T13:09:00.000Z'));

      await fixture.whenUserSeesTheWallOf("Alice");

      fixture.thenUserShouldSee([{
        author: "Bob",
        text: "Hi my name is Bob",
        publicationTime: "less than a minute ago"
      }, {
        author: "Alice",
        text: "Hi my name is Alice",
        publicationTime: "2 minutes ago"
      }])

    });

    test("Alice has subscribed to nobody. She can only see her own messages", async () => {
      messagingFixture.givenFollowingMessagesExist([
        messageBuilder()
          .withId('1')
          .authoredBy('Alice')
          .withText('Hi my name is Alice')
          .publishedAt(new Date('2023-06-21T13:07:00.000Z'))
          .build(),
        messageBuilder()
          .withId('2')
          .authoredBy('Bob')
          .withText('Hi my name is Bob')
          .publishedAt(new Date('2023-06-21T13:08:30.000Z'))
          .build(),
        messageBuilder()
          .withId('3')
          .authoredBy('Charlie')
          .withText('Nice to meet you! My name is Charlie')
          .publishedAt(new Date('2023-06-21T13:09:00.000Z'))
          .build()
      ]);



      fixture.givenNowIs(new Date('2023-06-21T13:09:00.000Z'));

      await fixture.whenUserSeesTheWallOf("Alice");

      fixture.thenUserShouldSee([{
        author: "Alice",
        text: "Hi my name is Alice",
        publicationTime: "2 minutes ago"
      }])

    })

    test("Alice has subscribed to Bob and Charlie. She can see her wall with her messages, Bob's messages and Charlie's messages", async () => {
      messagingFixture.givenFollowingMessagesExist([
        messageBuilder()
          .withId('1')
          .authoredBy('Alice')
          .withText('Hi my name is Alice')
          .publishedAt(new Date('2023-06-21T13:07:00.000Z'))
          .build(),
        messageBuilder()
          .withId('2')
          .authoredBy('Bob')
          .withText('Hi my name is Bob')
          .publishedAt(new Date('2023-06-21T13:08:30.000Z'))
          .build(),
        messageBuilder()
          .withId('3')
          .authoredBy('Charlie')
          .withText('Nice to meet you! My name is Charlie')
          .publishedAt(new Date('2023-06-21T13:09:00.000Z'))
          .build()
      ]);

      await followeeFixture.givenUserFollowees({
        user: "Alice",
        followees: ["Bob", "Charlie"]
      });

      fixture.givenNowIs(new Date('2023-06-21T13:09:00.000Z'));

      await fixture.whenUserSeesTheWallOf("Alice");

      fixture.thenUserShouldSee([{
        author: "Charlie",
        text: "Nice to meet you! My name is Charlie",
        publicationTime: "less than a minute ago"
      }, {
        author: "Bob",
        text: "Hi my name is Bob",
        publicationTime: "less than a minute ago"
      }, {
        author: "Alice",
        text: "Hi my name is Alice",
        publicationTime: "2 minutes ago"
      }])

    });


  })
})

const createFixture = (
  {
    messageRepository = new InMemoryMessageRepository(),
    followeeRepository = new InMemoryFolloweeRepository()
  }: {
    messageRepository: MessageRepository,
    followeeRepository: FolloweeRepository
  }) => {
  let wall: { author: string, text: string, publicationTime: string }[];
  const dateProvider = new StubDateProvider();
  const viewWallUseCase = new ViewWallUseCase(messageRepository, followeeRepository, dateProvider);

  return {
    givenNowIs(now: Date) {
      dateProvider.now = now
    },
    async whenUserSeesTheWallOf(user: string) {
      wall = await viewWallUseCase.handle({ user })

    },
    thenUserShouldSee(expectedWall: { author: string, text: string, publicationTime: string }[]) {
      expect(wall).toEqual(expectedWall);

    }
  }
}

// continuer le ViewWallUseCase, justemenet pour réfléchir à comment je pourrais le faire .. puis je verrais comment Pierre l'a fait. Non? 
// > Charlie -> I'm in New York today! Anyone wants to have a coffee?
// > Charlie follows Alice
// > Charlie wall
// > Charlie - I'm in New York today! Anyone wants to have a coffee? (2 seconds ago)
// > Alice - I love the weather today (5 minutes ago)

// > Charlie follows Bob
// > Charlie wall
// > Charlie - I'm in New York today! Anyone wants to have a coffee? (15 seconds ago)
// > Bob - Good game though. (1 minute ago)
// > Bob - Damn! We lost! (2 minutes ago)
// > Alice - I love the weather today (5 minutes ago)

type Fixture = ReturnType<typeof createFixture>

