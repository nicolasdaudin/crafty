import { MessageText } from "./message";
import { MessageRepository } from "./message.repository";

export type EditMessageCommand = {
  id: string,
  text: string,
}

export class EditMessageUseCase {
  constructor(private readonly messageRepository: MessageRepository) { }
  async handle(editMessageCommand: EditMessageCommand) {

    const messageText = MessageText.of(editMessageCommand.text);

    const message = await this.messageRepository.getById(editMessageCommand.id)
    message.text = messageText;
    await this.messageRepository.save(message);
  }
}