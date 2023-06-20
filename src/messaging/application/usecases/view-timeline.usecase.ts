import { DateProvider } from "../date-provider";
import { MessageRepository } from "../message.repository";


const MAX_MESSAGES_IN_TIMELINE = 5;
export class ViewTimelineUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly dateProvider: DateProvider) { }
  async handle({ user }: { user: string }): Promise<{ author: string, text: string, publicationTime: string }[]> {
    const messagesOfUser = await this.messageRepository.getAllOfUser(user)
    messagesOfUser.sort((msgA, msgB) => msgB.publishedAt.getTime() - msgA.publishedAt.getTime())

    const now = this.dateProvider.getNow();

    return messagesOfUser.slice(0, MAX_MESSAGES_IN_TIMELINE).map(({ author, text, publishedAt }) => ({ author, text: text.value, publicationTime: this.publicationTime(now, publishedAt) }));


  }

  publicationTime(now: Date, publishedAt: Date): string {
    const diff = now.getTime() - publishedAt.getTime();

    const minutes = Math.floor(diff / (60 * 1000));

    if (minutes < 1) {
      return 'less than a minute ago';
    };
    if (minutes < 2) {
      return '1 minute ago';
    }
    return `${minutes} minutes ago`
  }
}


