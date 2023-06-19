import { Message } from "./message";

export interface MessageRepository {
  getById(id: string): Promise<Message>;
  getAllOfUser(user: string): Promise<Message[]>;
  // read(): Promise<Message[]>;
  save(msg: Message): Promise<void>;
}