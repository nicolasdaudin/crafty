#!/usr/bin/env node

import { Argument, program } from "commander";
import { DateProvider, PostMessageCommand, PostMessageUseCase } from "./src/post-message.usecase";
import { InMemoryMessageRepository } from "./src/message.inmemory.repository";

class RealDateProvider implements DateProvider {
  getNow(): Date {
    return new Date();
  }
}

const dateProvider = new RealDateProvider();
const messageRepository = new InMemoryMessageRepository();
const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);

const crafty = program.version('1.0.0').description('Crafty social network by Nico');
crafty.command('post').addArgument(new Argument('user', 'name of the user')).addArgument(new Argument('message', 'message to be posted')).action((user: string, message: string) => {
  const postMessageCommand: PostMessageCommand = {
    id: 'test-id-CLI',
    author: user,
    text: message
  }
  try {
    postMessageUseCase.handle(postMessageCommand);
    console.table([messageRepository.message])
    console.log('✅ Message posté');
  } catch (error) {
    console.log('❌ Message non posté. Erreur:', error);

  }
});

async function main() {
  crafty.parseAsync();
}
main();

