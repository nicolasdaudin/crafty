import { FolloweeRepository } from "../followee/followee.repository";
import { DateProvider } from "../messaging/application/date-provider";
import { MessageRepository } from "../messaging/application/message.repository";
import { Timeline } from "../messaging/domain/timeline";

export class ViewWallUseCase {

  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly followeeRepository: FolloweeRepository,
    private readonly dateProvider: DateProvider,
  ) { }

  async handle({ user }: { user: string }): Promise<{ author: string, text: string, publicationTime: string }[]> {
    const followees = await this.followeeRepository.getFolloweesOf(user);

    const messagesOfUser = await this.messageRepository.getAllOfUser(user);

    const messagesOfFollowees = await Promise.all(followees.map(followee => this.messageRepository.getAllOfUser(followee)))

    const messages = messagesOfUser.concat(messagesOfFollowees.flat())

    const now = await this.dateProvider.getNow();

    const timeline = new Timeline(messages, now);
    return timeline.data;
  }
}