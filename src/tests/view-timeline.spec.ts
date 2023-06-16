
import { resolve } from "path";
import { InMemoryMessageRepository } from "../message.inmemory.repository";
import { Message } from "../post-message.usecase";
import { ViewTimelineUseCase } from "../view-timeline.usecase";
import { StubDateProvider } from "../stub-data-provider";

describe('Feature: View a timeline', () => {
  let fixture: Fixture;
  beforeEach(() => {
    fixture = createFixture();
  })
  describe('Rule: Messages are in reverse chronological order', () => {
    test("Alice can see her timeline with messages in reverse order", async () => {
      fixture.givenFollowingMessagesExist([
        { id: 'message-1', author: 'Alice', text: 'Hello there', publishedAt: new Date('2023-06-08T12:50:00Z') },
        { id: 'message-2', author: 'Bob', text: 'Hey guys whats up?', publishedAt: new Date('2023-06-08T12:51:00Z') },
        { id: 'message-3', author: 'Alice', text: 'How are you?', publishedAt: new Date('2023-06-08T12:52:00Z') },
        { id: 'message-4', author: 'Alice', text: 'Anybody?', publishedAt: new Date('2023-06-08T12:52:30Z') },
      ])
      fixture.givenNowIs(new Date('2023-06-08T12:53:00Z'))

      await fixture.whenUserViewTimelineOf('Alice');

      fixture.thenUserShouldSee([
        { author: 'Alice', text: 'Anybody?', publicationTime: 'less than a minute ago' },
        { author: 'Alice', text: 'How are you?', publicationTime: '1 minute ago' },
        { author: 'Alice', text: 'Hello there', publicationTime: '3 minutes ago' },
      ]);
    });



    // test("Alice can see an empty timeline", async () => {
    //   fixture.givenFollowingMessagesExist([])

    //   await fixture.whenUserViewsHisTimeline({ author: "Alice" });

    //   fixture.thenUserShouldSee([]);
    // });
  })

  // describe("Rule: Timeline can only display 5 messages", () => {
  //   test("Alice can see the last 5 messages out of a timeline of 6 messages", async () => {
  //     fixture.givenFollowingMessagesExist([
  //       { id: 'message-id-1', text: 'message 1', author: 'Alice', publishedAt: new Date('2023-06-08T12:50:00Z') },
  //       { id: 'message-id-2', text: 'message 2', author: 'Alice', publishedAt: new Date('2023-06-08T12:51:00Z') },
  //       { id: 'message-id-3', text: 'message 3', author: 'Alice', publishedAt: new Date('2023-06-08T12:52:00Z') },
  //       { id: 'message-id-4', text: 'message 4', author: 'Alice', publishedAt: new Date('2023-06-08T12:53:00Z') },
  //       { id: 'message-id-5', text: 'message 5', author: 'Alice', publishedAt: new Date('2023-06-08T12:54:00Z') },
  //       { id: 'message-id-6', text: 'message 6', author: 'Alice', publishedAt: new Date('2023-06-08T12:55:00Z') },
  //     ])

  //     await fixture.whenUserViewsHisTimeline({ author: 'Alice' });

  //     fixture.thenUserShouldSee([
  //       { id: 'message-id-6', text: 'message 6', author: 'Alice', publishedAt: new Date('2023-06-08T12:55:00Z') },
  //       { id: 'message-id-5', text: 'message 5', author: 'Alice', publishedAt: new Date('2023-06-08T12:54:00Z') },
  //       { id: 'message-id-4', text: 'message 4', author: 'Alice', publishedAt: new Date('2023-06-08T12:53:00Z') },
  //       { id: 'message-id-3', text: 'message 3', author: 'Alice', publishedAt: new Date('2023-06-08T12:52:00Z') },
  //       { id: 'message-id-2', text: 'message 2', author: 'Alice', publishedAt: new Date('2023-06-08T12:51:00Z') }
  //     ]);
  //   })
  // })

  // describe("Rule: An author can only see his messages", () => {
  //   test("Alice can see her messages but not Bob's messages", async () => {
  //     fixture.givenFollowingMessagesExist([
  //       { id: 'message-id-1', text: 'message 1', author: 'Alice', publishedAt: new Date('2023-06-08T12:50:00Z') },
  //       { id: 'message-id-1', text: 'message 2', author: 'Bob', publishedAt: new Date('2023-06-08T12:53:00Z') },

  //     ])

  //     await fixture.whenUserViewsHisTimeline({ author: 'Alice' });

  //     fixture.thenUserShouldSee([
  //       { id: 'message-id-1', text: 'message 1', author: 'Alice', publishedAt: new Date('2023-06-08T12:50:00Z') }
  //     ]);
  //   })
  // })
})




const createFixture = () => {
  let timeline: { author: string, text: string, publicationTime: string }[];
  const messageRepository = new InMemoryMessageRepository();
  // console.log(new Date().getTime());
  // await new Promise((resolve) => setTimeout(resolve, 234));
  const dateProvider = new StubDateProvider();
  const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository, dateProvider);

  return {
    givenFollowingMessagesExist(_msgs: Message[]) {
      messageRepository.givenExistingMessages(_msgs);
    },
    givenNowIs(now: Date) {
      dateProvider.now = now
    },
    async whenUserViewTimelineOf(user: string) {
      timeline = await viewTimelineUseCase.handle({ user });
    },
    thenUserShouldSee(expectedTimeline: { author: string, text: string, publicationTime: string }[]) {
      expect(timeline).toEqual(expectedTimeline);
    }
  }
}

type Fixture = ReturnType<typeof createFixture>;



