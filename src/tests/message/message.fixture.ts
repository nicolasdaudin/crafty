import { EditMessageCommand, EditMessageUseCase } from "../../edit-message.usecase";
import { Message } from "../../message";
import { InMemoryMessageRepository } from "../../message.inmemory.repository";
import { PostMessageCommand, PostMessageUseCase } from "../../post-message.usecase";
import { StubDateProvider } from "../../stub-data-provider";
import { ViewTimelineUseCase } from "../../view-timeline.usecase";

export const createMessagingFixture = () => {
  let timeline: { author: string, text: string, publicationTime: string }[];
  const messageRepository = new InMemoryMessageRepository();
  const dateProvider = new StubDateProvider();
  const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository, dateProvider);
  const postMessageUseCase = new PostMessageUseCase(
    messageRepository,
    dateProvider
  );
  const editMessageUseCase = new EditMessageUseCase(messageRepository);
  let thrownError: Error;

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
      console.log(timeline);
      expect(timeline).toEqual(expectedTimeline);
    },
    async whenUserPostsAMessage(postMessageCommand: PostMessageCommand) {
      try {
        await postMessageUseCase.handle(postMessageCommand)
      } catch (error) {
        thrownError = error;
      }
    },
    async whenUserEditsMessage(editMessageCommand: EditMessageCommand) {
      try {
        await editMessageUseCase.handle(editMessageCommand);
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

export type MessagingFixture = ReturnType<typeof createMessagingFixture>;
