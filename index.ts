#!/usr/bin/env node

import { Argument, program } from "commander";
import { FileMessageRepository } from "./src/messaging/infra/message.file.repository";
import { EditMessageCommand, EditMessageUseCase } from "./src/messaging/application/usecases/edit-message.usecase";
import { RealDateProvider } from "./src/messaging/infra/real-date-provider";
import { PostMessageCommand, PostMessageUseCase } from "./src/messaging/application/usecases/post-message.usecase";
import { ViewTimelineUseCase } from "./src/messaging/application/usecases/view-timeline.usecase";
import { FollowUserCommand, FollowUserUseCase } from "./src/followee/follow-user.usecase";
import { FileSystemFolloweeRepository } from "./src/followee/infra/followee.file.repository";
import { ViewWallUseCase } from "./src/wall/view-wall.usecase";



const dateProvider = new RealDateProvider();
// const messageRepository = new InMemoryMessageRepository();
const messageRepository = new FileMessageRepository();
const followeeRepository = new FileSystemFolloweeRepository();
const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);
const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository, dateProvider);
const editMessageUseCase = new EditMessageUseCase(messageRepository);
const followUserUseCase = new FollowUserUseCase(followeeRepository);
const viewWallUseCase = new ViewWallUseCase(messageRepository, followeeRepository, dateProvider);
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
      await postMessageUseCase.handle(postMessageCommand);

      console.log('✅ Message posté');
    } catch (error) {
      console.log('❌ Message non posté. Erreur:', error);

    }
  });

crafty.command('view').addArgument(new Argument('<user>', 'name of the user for which we want to see the timeline')).action(async (user: string) => {

  try {
    const timeline = await viewTimelineUseCase.handle({ user });


    console.log('✅ Timeline dispo');
    console.table(timeline);
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
      await editMessageUseCase.handle(editMessageCommand);

      console.log('✅ Message edité');
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
      const timeline = await viewWallUseCase.handle({ user });
      console.table(timeline)
      console.log('✅ Le wall a pu être visualisé');
    } catch (error) {
      console.log('❌ Le Wall ne peut pas être visualisé. Erreur:', error);
    }
  })

async function main() {
  crafty.parseAsync();
}
main();

