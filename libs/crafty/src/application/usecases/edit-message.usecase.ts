import { Injectable } from "@nestjs/common";
import { MessageEmptyError, MessageTooLongError } from "../../domain/message";
import { MessageRepository } from "../message.repository";
import { Err, Ok, Result } from "../result";

export type EditMessageCommand = {
  id: string,
  text: string,
}

@Injectable()
export class EditMessageUseCase {
  constructor(private readonly messageRepository: MessageRepository) { }
  async handle(editMessageCommand: EditMessageCommand): Promise<Result<void, MessageEmptyError | MessageTooLongError>> {


    const message = await this.messageRepository.getById(editMessageCommand.id)

    try {
      message.editText(editMessageCommand.text);
    } catch (error) {
      if (error instanceof MessageEmptyError) {
        console.error('The message is empty, come on dude!')
      }
      return Err.of(error);
    }


    await this.messageRepository.save(message);

    return Ok.of(undefined);
  }
}