#!/usr/bin/env node

import { Argument, program } from "commander";
import { EditMessageCommand, EditMessageUseCase } from "../application/usecases/edit-message.usecase";
import { PostMessageCommand, PostMessageUseCase } from "../application/usecases/post-message.usecase";
import { ViewTimelineUseCase } from "../application/usecases/view-timeline.usecase";
import { FollowUserCommand, FollowUserUseCase } from "../application/usecases/follow-user.usecase";
import { ViewWallUseCase } from "../application/usecases/view-wall.usecase";
import { PrismaClient } from "@prisma/client";
import { PrismaMessageRepository } from "../infra/prisma/message.prisma.repository";
import { PrismaFolloweeRepository } from "../infra/prisma/followee.prisma.repository";
import { DefaultTimelinePresenter } from "./timeline.default.presenter";
import { CLITimelinePresenter } from "./timeline.cli.presenter";
import { RealDateProvider } from "../infra/real-date-provider";



const dateProvider = new RealDateProvider();

const prismaClient = new PrismaClient();
const messageRepository = new PrismaMessageRepository(prismaClient);
const followeeRepository = new PrismaFolloweeRepository(prismaClient);
const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);
const defaultTimelinePresenter = new DefaultTimelinePresenter(dateProvider);
const cliTimelinePresenter = new CLITimelinePresenter(defaultTimelinePresenter);
const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository);
const editMessageUseCase = new EditMessageUseCase(messageRepository);
const followUserUseCase = new FollowUserUseCase(followeeRepository);
const viewWallUseCase = new ViewWallUseCase(messageRepository, followeeRepository);

const crafty = program.version('1.0.0').description('Crafty social network by Nico');
crafty.command('post')
  .addArgument(new Argument('<user>', 'name of the user'))
  .addArgument(new Argument('<message>', 'message to be posted'))
  .action(async (user: string, message: string) => {
    const postMessageCommand: PostMessageCommand = {
      id: `${Math.floor(Math.random() * 10000)}`,
      author: user,
      text: message
    };

    try {
      const result = await postMessageUseCase.handle(postMessageCommand);
      if (result.isOk()) {
        console.log('✅ Message posté');
        process.exit(0);
      }
      console.error('❌ Message non posté. Erreur:', result.error);
      process.exit(1);
    } catch (error) {
      console.log('❌ Message non posté. Erreur:', error);
      process.exit(1);

    }
  });

crafty.command('view').addArgument(new Argument('<user>', 'name of the user for which we want to see the timeline')).action(async (user: string) => {

  try {
    await viewTimelineUseCase.handle({ user }, cliTimelinePresenter);


    console.log('✅ Timeline dispo');
  } catch (error) {
    console.log('❌ Timeline non dispo. Erreur:', error);

  }
})

crafty.command('edit')
  .addArgument(new Argument('<message-id>', 'id of the message to be edited'))
  .addArgument(new Argument('<message>', 'new message text'))
  .action(async (messageId: string, message: string) => {
    const editMessageCommand: EditMessageCommand = {
      id: messageId,
      text: message
    };

    try {
      const result = await editMessageUseCase.handle(editMessageCommand);

      if (result.isOk()) {
        console.log('✅ Message edité');
        process.exit(0);
      }
      console.log('❌ Message non edité. Erreur:', result.error);
    } catch (error) {
      console.log('❌ Message non edité. Erreur:', error);

    }
  })


crafty.command('follow')
  .addArgument(new Argument('user', 'user name'))
  .addArgument(new Argument('user-to-follow', 'user to follow'))
  .action(async (user: string, userToFollow: string) => {
    const followUserCommand: FollowUserCommand = {
      user: user,
      userToFollow
    }

    try {
      await followUserUseCase.handle(followUserCommand);
      const myUser = await followeeRepository.getFolloweesOf(user);
      console.log(myUser)
      console.log('✅ User abonné');
    } catch (error) {
      console.log('❌ User non abonné. Erreur:', error);
    }
  })

crafty.command('wall')
  .addArgument(new Argument('user', `user's wall we want to see`))
  .action(async (user: string) => {
    try {
      await viewWallUseCase.handle({ user }, cliTimelinePresenter);
      console.log('✅ Le wall a pu être visualisé');
    } catch (error) {
      console.log('❌ Le Wall ne peut pas être visualisé. Erreur:', error);
    }
  })

async function main() {
  await crafty.parseAsync();
}
main();

