#!/usr/bin/env node

import { Argument, program } from "commander";
import { DateProvider, PostMessageCommand, PostMessageUseCase } from "./src/post-message.usecase";
import { InMemoryMessageRepository } from "./src/message.inmemory.repository";
import { FileMessageRepository } from "./src/message.file.repository";

class RealDateProvider implements DateProvider {
  getNow(): Date {
    return new Date();
  }
}

const dateProvider = new RealDateProvider();
// const messageRepository = new InMemoryMessageRepository();
const messageRepository = new FileMessageRepository();
const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);


const crafty = program.version('1.0.0').description('Crafty social network by Nico');
crafty.command('post')
  .addArgument(new Argument('<user>', 'name of the user'))
  .addArgument(new Argument('<message>', 'message to be posted'))
  .action(async (user: string, message: string) => {
    const postMessageCommand: PostMessageCommand = {
      id: 'test-id-CLI',
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

// crafty.command('view').addArgument(new Argument('<user>', 'name of the user for which we want to see the timeline')).action(async (user: string) => {
//   const viewTimelineQuery: ViewTimelineQuery = { author: user };
//   try {
//     await viewTimeLineUseCase.handle(viewTimelineQuery);


//     console.log('✅ Timeline dispo');
//     console.table(timelineRenderer.timeline);
//   } catch (error) {
//     console.log('❌ Timeline non dispo. Erreur:', error);

//   }

// })

async function main() {
  crafty.parseAsync();
}
main();

