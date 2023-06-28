import { DefaultTimelinePresenter } from "../../apps/timeline.default.presenter";
import { EditMessageUseCase, EditMessageCommand } from "../application/usecases/edit-message.usecase";
import { PostMessageUseCase, PostMessageCommand } from "../application/usecases/post-message.usecase";
import { ViewTimelineUseCase } from "../application/usecases/view-timeline.usecase";
import { Message } from "../domain/message";
import { InMemoryMessageRepository } from "../infra/message.inmemory.repository";
import { StubDateProvider } from "../infra/stub-data-provider";

export const createMessagingFixture = () => {
  let timeline: { author: string, text: string, publicationTime: string }[];
  const messageRepository = new InMemoryMessageRepository();
  const dateProvider = new StubDateProvider();
  const defaultTimelinePresenter = new DefaultTimelinePresenter(dateProvider);
  const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository);
  const postMessageUseCase = new PostMessageUseCase(
    messageRepository,
    dateProvider
  );
  const editMessageUseCase = new EditMessageUseCase(messageRepository);
  let thrownError: Error;

  return {
    // getDateProvider() {
    //   return dateProvider;
    // },
    givenFollowingMessagesExist(_msgs: Message[]) {
      messageRepository.givenExistingMessages(_msgs);
    },
    givenNowIs(now: Date) {
      dateProvider.now = now
    },
    async whenUserViewTimelineOf(user: string) {
      timeline = await viewTimelineUseCase.handle({ user }, defaultTimelinePresenter);
    },
    thenUserShouldSee(expectedTimeline: { author: string, text: string, publicationTime: string }[]) {

      expect(timeline).toEqual(expectedTimeline);
    },
    async whenUserPostsAMessage(postMessageCommand: PostMessageCommand) {
      const result = await postMessageUseCase.handle(postMessageCommand);
      if (result.isErr()) {
        thrownError = result.error;
      }

    },
    async whenUserEditsMessage(editMessageCommand: EditMessageCommand) {
      const result = await editMessageUseCase.handle(editMessageCommand);
      if (result.isErr()) {
        thrownError = result.error;
      }

    },

    thenPostedMessageShouldBe(expected: Message) {
      expect(expected).toEqual(messageRepository.getMessageById(expected.id))
    },
    thenErrorShouldBe(expectedErrorClass: new () => Error) {
      expect(thrownError).toBeInstanceOf(expectedErrorClass);
    },
    messageRepository,
  }
}

export type MessagingFixture = ReturnType<typeof createMessagingFixture>;
