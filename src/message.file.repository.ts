import * as fs from 'fs';
import * as path from 'path';
import { MessageRepository } from "./message.repository";
import { Message, MessageText } from './message';
export class FileMessageRepository implements MessageRepository {

  constructor(private readonly filePath = path.join(__dirname, 'crafty.json')) { }

  async save(_msg: Message): Promise<void> {

    let messages = await this.getMessages();

    const existingMessageIndex = messages.findIndex(message => message.id === _msg.id);
    if (existingMessageIndex > -1) {
      messages[existingMessageIndex] = _msg
    } else {
      messages.push(_msg);
    }

    return fs.promises.writeFile(this.filePath, JSON.stringify(messages.map(m => ({
      id: m.id,
      author: m.author,
      text: m.text.value,
      publishedAt: m.publishedAt
    }))));
  }



  async getById(id: string): Promise<Message> {
    const messages = await this.getMessages();
    return messages.find(message => message.id === id)!
  }

  async getAllOfUser(user: string): Promise<Message[]> {
    const messages = await this.getMessages();
    return messages.filter(m => m.author === user)
  }

  private async getMessages(): Promise<Message[]> {
    const data = await fs.promises.readFile(this.filePath, 'utf-8')
    const messages = JSON.parse(data.toString()) as { id: string, author: string, text: string, publishedAt: string }[];

    return messages.map((message) => ({
      id: message.id,
      author: message.author,
      text: MessageText.of(message.text),
      publishedAt: new Date(message.publishedAt)
    }))

  }
}

