import { MessageRepository } from "./message.repository";
import { MessageEmptyError, MessageTooLongError } from "./post-message.usecase";

export type EditMessageCommand = {
  id: string,
  text: string,
}

export class EditMessageUseCase {
  constructor(private readonly messageRepository: MessageRepository) { }
  async handle(editMessageCommand: EditMessageCommand) {
    // console.log(editMessageCommand.text.length)
    if (editMessageCommand.text.length > 280) {
      throw new MessageTooLongError()
    }

    if (editMessageCommand.text.trim().length === 0) {
      throw new MessageEmptyError()
    }

    const message = await this.messageRepository.getById(editMessageCommand.id)
    message.text = editMessageCommand.text;
    await this.messageRepository.save(message);
  }
}