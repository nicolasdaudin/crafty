import { TimelinePresenter } from "../timeline.presenter";
import { FolloweeRepository } from "../followee.repository";
import { DateProvider } from "../date-provider";
import { MessageRepository } from "../message.repository";
import { Timeline } from "../../domain/timeline";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ViewWallUseCase {

  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly followeeRepository: FolloweeRepository,
  ) { }

  async handle({ user }: { user: string }, timelinePresenter: TimelinePresenter): Promise<{ author: string, text: string, publicationTime: string }[]> {
    const followees = await this.followeeRepository.getFolloweesOf(user);

    const messagesOfUser = await this.messageRepository.getAllOfUser(user);

    const messagesOfFollowees = await Promise.all(followees.map(followee => this.messageRepository.getAllOfUser(followee)))

    const messages = messagesOfUser.concat(messagesOfFollowees.flat())

    const timeline = new Timeline(messages);
    return timelinePresenter.show(timeline);
  }
}