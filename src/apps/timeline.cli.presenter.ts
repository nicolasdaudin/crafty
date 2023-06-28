import { Timeline } from "../messaging/domain/timeline";
import { DefaultTimelinePresenter } from "./timeline.default.presenter";
import { TimelinePresenter } from "./timeline.presenter";

export class CLITimelinePresenter implements TimelinePresenter {
  constructor(private readonly defaultTimelinePresenter: DefaultTimelinePresenter) { }

  show(timeline: Timeline) {
    console.table(this.defaultTimelinePresenter.show(timeline))
  }
}