import { PrismaClient } from "@prisma/client";
import { MessageRepository } from "../../application/message.repository";
import { Message } from "../../domain/message";
import { Injectable } from "@nestjs/common";


// in case of complex usecases, we could have a 'Message' (and User?) object representing the items en database, and some helper to do the mapping between Database objects and app objects, but here it's not complex
// This mapping would be here, part of the repository 
// but here we do it directly (id: message.id, ...)
@Injectable()
export class PrismaMessageRepository implements MessageRepository {
  constructor(private readonly prisma: PrismaClient) { }
  async save(msg: Message): Promise<void> {
    const messageData = msg.data;

    // create User if non existent
    await this.prisma.user.upsert({
      where: { name: messageData.author },
      create: { name: messageData.author },
      update: { name: messageData.author }
    })

    // Create message
    await this.prisma.message.upsert({
      where: { id: messageData.id },
      create: {
        id: messageData.id,
        authorId: messageData.author,
        text: messageData.text,
        publishedAt: messageData.publishedAt
      },
      update: {
        id: messageData.id,
        authorId: messageData.author,
        text: messageData.text,
        publishedAt: messageData.publishedAt
      },
    })

  }

  async getById(id: string): Promise<Message> {
    const messageData = await this.prisma.message.findFirstOrThrow({ where: { id } });
    console.log({ id })
    console.log({ messageData });
    return Message.fromData({
      id: messageData.id,
      author: messageData.authorId,
      text: messageData.text,
      publishedAt: messageData.publishedAt
    })


  }

  async getAllOfUser(user: string): Promise<Message[]> {
    const messagesData = await this.prisma.message.findMany({ where: { authorId: user } });

    return messagesData.map(m => Message.fromData({
      id: m.id,
      author: m.authorId,
      text: m.text,
      publishedAt: m.publishedAt
    }))
  };

}