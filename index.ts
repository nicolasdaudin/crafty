#!/usr/bin/env node

import { Argument, program } from "commander";
import { FileMessageRepository } from "./src/messaging/infra/message.file.repository";
import { EditMessageCommand, EditMessageUseCase } from "./src/messaging/application/usecases/edit-message.usecase";
import { RealDateProvider } from "./src/messaging/infra/real-date-provider";
import { PostMessageCommand, PostMessageUseCase } from "./src/messaging/application/usecases/post-message.usecase";
import { ViewTimelineUseCase } from "./src/messaging/application/usecases/view-timeline.usecase";



const dateProvider = new RealDateProvider();
// const messageRepository = new InMemoryMessageRepository();
const messageRepository = new FileMessageRepository();
const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);
const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository, dateProvider);
const editMessageUseCase = new EditMessageUseCase(messageRepository);

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

async function main() {
  crafty.parseAsync();
}
main();

