import { Injectable } from "@nestjs/common";
import { Message } from "../domain/message";

@Injectable()
export abstract class MessageRepository {
  abstract getById(id: string): Promise<Message>;
  abstract getAllOfUser(user: string): Promise<Message[]>;
  // read(): Promise<Message[]>;
  abstract save(msg: Message): Promise<void>;
}