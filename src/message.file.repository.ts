import { Message, MessageRepository } from "./post-message.usecase";
import * as fs from 'fs';
import * as path from 'path';
export class FileMessageRepository implements MessageRepository {
  filePath = 'crafty.txt';

  async save(msg: Message): Promise<void> {

    let messages: Message[] = [];
    try {
      const data = await fs.promises.readFile(path.join(__dirname, this.filePath), 'utf-8')
      messages = transformParsedContentIntoMessages(JSON.parse(data))
    } catch {
    }
    messages.push(msg);
    return fs.promises.writeFile(path.join(__dirname, this.filePath), JSON.stringify(messages));
  }
  async read(): Promise<Message[]> {
    const data = await fs.promises.readFile(path.join(__dirname, this.filePath), 'utf-8')
    return transformParsedContentIntoMessages(JSON.parse(data))

  }

}

const transformParsedContentIntoMessages = (parsed: any[]): Message[] => {
  return parsed.map<Message>(({ id, author, text, publishedAt }) => ({ author, text, id, publishedAt: new Date(publishedAt) }))
}