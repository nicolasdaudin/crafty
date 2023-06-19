import * as fs from 'fs';
import * as path from 'path';
import { MessageRepository } from "./message.repository";
import { Message } from './message';
export class FileMessageRepository implements MessageRepository {

  private readonly filePath = path.join(__dirname, 'crafty.json');

  async save(_msg: Message): Promise<void> {

    let messages: Message[] = [];
    try {
      const data = await fs.promises.readFile(this.filePath, 'utf-8');
      messages = transformParsedContentIntoMessages(JSON.parse(data))
    } catch {
    }

    const existingMessageIndex = messages.findIndex(message => message.id === _msg.id);
    if (existingMessageIndex > -1) {
      messages[existingMessageIndex] = _msg
    } else {
      messages.push(_msg);
    }

    return fs.promises.writeFile(this.filePath, JSON.stringify(messages));
  }
  async read(): Promise<Message[]> {
    const data = await fs.promises.readFile(this.filePath, 'utf-8')
    return transformParsedContentIntoMessages(JSON.parse(data))

  }

  async getById(id: string): Promise<Message> {
    const messages = await this.read();
    return messages.find(message => message.id === id)!
  }

  async getAllOfUser(user: string): Promise<Message[]> {
    return (await this.read()).filter(m => m.author === user)
  }
}

const transformParsedContentIntoMessages = (parsed: any[]): Message[] => {
  return parsed.map<Message>(({ id, author, text, publishedAt }) => ({ author, text, id, publishedAt: new Date(publishedAt) }))
}