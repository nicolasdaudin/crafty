import { Message, MessageRepository } from "./post-message.usecase";
import * as fs from 'fs';
import * as path from 'path';
export class FileMessageRepository implements MessageRepository {
  filePath = 'crafty.txt';
  save(msg: Message): Promise<void> {
    return fs.promises.writeFile(path.join(__dirname, this.filePath), JSON.stringify(msg));
  }



}