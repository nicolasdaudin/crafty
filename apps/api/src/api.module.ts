import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { CraftyModule } from '@crafty/crafty';
import { PrismaFolloweeRepository } from '@crafty/crafty/infra/prisma/followee.prisma.repository';
import { PrismaMessageRepository } from '@crafty/crafty/infra/prisma/message.prisma.repository';
import { PrismaService } from '@crafty/crafty/infra/prisma/prisma.service';
import { RealDateProvider } from '@crafty/crafty/infra/real-date-provider';

@Module({
  imports: [CraftyModule.register({
    MessageRepository: PrismaMessageRepository,
    FolloweeRepository: PrismaFolloweeRepository,
    DateProvider: RealDateProvider,
    PrismaClient: PrismaService,
    messageRepositoryProvided: PrismaMessageRepository
  })],
  controllers: [ApiController],
  providers: [],
})
export class ApiModule { }
