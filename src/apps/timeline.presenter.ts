import { Timeline } from "../messaging/domain/timeline";

export interface TimelinePresenter {
  show(timeline: Timeline)
} 