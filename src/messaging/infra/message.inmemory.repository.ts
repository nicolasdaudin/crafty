import { MessageRepository } from "../application/message.repository";
import { Message } from "../domain/message";

export class InMemoryMessageRepository implements MessageRepository {


  messages = new Map<string, Message>()

  givenExistingMessages(_msgs: Message[]) {
    _msgs.forEach(msg => this.messages.set(msg.id, msg));
  }
  async save(msg: Message): Promise<void> {
    this.messages.set(msg.id, msg);
  }

  async getById(id: string): Promise<Message> {
    return this.getMessageById(id);
  }


  getMessageById(messageId: string) {
    return this.messages.get(messageId)!;
  }

  getAllOfUser(user: string): Promise<Message[]> {
    return Promise.resolve([...this.messages.values()].filter(msg => msg.author === user))
  }



}
