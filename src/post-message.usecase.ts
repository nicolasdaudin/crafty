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
  getAllOfUser(user: string): Promise<Message[]>;
  // read(): Promise<Message[]>;
  save(msg: Message): Promise<void>;
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

  async handle(postMessageCommand: PostMessageCommand) {

    if (postMessageCommand.text.length > 280) {
      throw new MessageTooLongError();
    }
    if (postMessageCommand.text.trim().length === 0) {
      throw new MessageEmptyError();
    }

    await this.messageRepository.save({
      id: postMessageCommand.id,
      text: postMessageCommand.text,
      author: postMessageCommand.author,
      publishedAt: this.dateProvider.getNow()
    });
  }
}