import { FastifyReply } from "fastify";
import { Timeline } from "../messaging/domain/timeline";
import { TimelinePresenter } from "./timeline.presenter";

export class ApiTimelinePresenter implements TimelinePresenter {
  constructor(private readonly reply: FastifyReply) { }
  show(timeline: Timeline) {
    this.reply.status(200).send(timeline.data.map(m => m.data));
  }

}