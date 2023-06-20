import { Message, MessageText } from "./message";
import { MessageRepository } from "./message.repository";

export type EditMessageCommand = {
  id: string,
  text: string,
}

export class EditMessageUseCase {
  constructor(private readonly messageRepository: MessageRepository) { }
  async handle(editMessageCommand: EditMessageCommand) {


    const message = await this.messageRepository.getById(editMessageCommand.id)

    message.editText(editMessageCommand.text);

    // const editedMessage = Message.fromData({
    //   ...message.data,
    //   text: editMessageCommand.text
    // })

    await this.messageRepository.save(message);
  }
}