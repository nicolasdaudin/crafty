import { Message, MessageEmptyError, MessageTooLongError } from "../../domain/message";
import { DateProvider } from "../date-provider";
import { MessageRepository } from "../message.repository";
import { Err, Ok, Result } from "../result";

export type PostMessageCommand = {
  id: string;
  text: string;
  author: string;
}



export class PostMessageUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly dateProvider: DateProvider) { }

  async handle(postMessageCommand: PostMessageCommand): Promise<Result<void, MessageEmptyError | MessageTooLongError>> {

    let message;

    try {
      message = Message.fromData({
        id: postMessageCommand.id,
        text: postMessageCommand.text,
        author: postMessageCommand.author,
        publishedAt: this.dateProvider.getNow()
      })
    } catch (err) {
      if (err instanceof MessageEmptyError) {
        console.error('The message is empty, come on dude!')
      }
      return Err.of(err)
    }

    await this.messageRepository.save(message)
    return Ok.of(undefined)
  }
}