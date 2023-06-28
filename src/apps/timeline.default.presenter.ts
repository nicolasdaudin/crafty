import { DateProvider } from "../messaging/application/date-provider";
import { Timeline } from "../messaging/domain/timeline";
import { TimelinePresenter } from "./timeline.presenter";

export class DefaultTimelinePresenter implements TimelinePresenter {
  constructor(private readonly dateProvider: DateProvider) { }

  show(timeline: Timeline): { author: string, text: string, publicationTime: string }[] {
    const messages = timeline.data;

    return messages.map(({ author, text, publishedAt }) => ({
      author, text: text.value, publicationTime: this.computePublicationTime(this.dateProvider.getNow(), publishedAt)
    }));


  }

  private computePublicationTime(now: Date, publishedAt: Date): string {
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