export type PostMessageCommand = {
  id: string;
  text: string;
  author: string;
}
export type Message = {
  id: string,
  text: string,
  author: string,
  publishedAt: Date
}

export interface MessageRepository {
  save(msg: Message | null): void;
}

export interface DateProvider {
  getNow(): Date;
}

export class MessageTooLongError extends Error { }
export class MessageEmptyError extends Error { }

export class PostMessageUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly dateProvider: DateProvider) { }

  handle(postMessageCommand: PostMessageCommand) {

    if (postMessageCommand.text.length > 280) {
      throw new MessageTooLongError();
    }
    this.messageRepository.save({
      id: postMessageCommand.id,
      text: postMessageCommand.text,
      author: postMessageCommand.author,
      publishedAt: this.dateProvider.getNow()
    });
  }
}