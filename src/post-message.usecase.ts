export type PostMessageCommand = { id: string; text: string; author: string; }
export type Message = { id: string, text: string, author: string, publishedAt: Date }

export interface MessageRepository {
  save(msg: Message): void;
}

export interface DateProvider {
  getNow(): Date;
}

export class PostMessageUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly dateProvider: DateProvider) { }

  handle(postMessageCommand: PostMessageCommand) {
    this.messageRepository.save({
      id: postMessageCommand.id,
      text: postMessageCommand.text,
      author: postMessageCommand.author,
      publishedAt: this.dateProvider.getNow()
    });
  }
}