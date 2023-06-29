import { Module } from '@nestjs/common';
import { CraftyModule } from '@crafty/crafty';
import { PrismaMessageRepository } from '@crafty/crafty/infra/prisma/message.prisma.repository';
import { PrismaFolloweeRepository } from '@crafty/crafty/infra/prisma/followee.prisma.repository';
import { RealDateProvider } from '@crafty/crafty/infra/real-date-provider';
import { commands } from './commands';
import { CLINestTimelinePresenter } from './cli.nest.timeline.presenter';
import { CustomConsoleLogger } from './custom.console.logger';
import { PrismaService } from '@crafty/crafty/infra/prisma/prisma.service';

@Module({
  imports: [CraftyModule.register({
    MessageRepository: PrismaMessageRepository,
    FolloweeRepository: PrismaFolloweeRepository,
    DateProvider: RealDateProvider,
    PrismaClient: PrismaService,
    messageRepositoryProvided: PrismaMessageRepository
  })],
  providers: [...commands, CLINestTimelinePresenter, CustomConsoleLogger],
})
export class CliModule { }
