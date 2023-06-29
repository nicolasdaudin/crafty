
import { Injectable } from '@nestjs/common';
import { CustomConsoleLogger } from "./custom.console.logger";
import { TimelinePresenter } from "@crafty/crafty/application/timeline.presenter";
import { DefaultTimelinePresenter } from "@crafty/crafty/apps/timeline.default.presenter";
import { Timeline } from '@crafty/crafty/domain/timeline';

@Injectable()
export class CLINestTimelinePresenter implements TimelinePresenter {
  // necessary to overwrite regular CLITimelinePresenter and add the logger cause the default Nest Console logger does not have the 'table' method. 
  constructor(
    private readonly defaultTimelinePresenter: DefaultTimelinePresenter,
    private readonly logger: CustomConsoleLogger
  ) { }

  show(timeline: Timeline) {
    this.logger.table(this.defaultTimelinePresenter.show(timeline))
  }
}