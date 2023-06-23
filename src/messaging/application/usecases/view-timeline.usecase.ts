import { Timeline } from "../../domain/timeline";
import { DateProvider } from "../date-provider";
import { MessageRepository } from "../message.repository";

export class ViewTimelineUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly dateProvider: DateProvider) { }
  async handle({ user }: { user: string }): Promise<{ author: string, text: string, publicationTime: string }[]> {
    const messagesOfUser = await this.messageRepository.getAllOfUser(user)
    const now = this.dateProvider.getNow();

    const timeline = new Timeline(messagesOfUser, now);
    return timeline.data;
  }
}


