import { EditMessageCommand, EditMessageUseCase } from '@crafty/crafty/application/usecases/edit-message.usecase';
import { FollowUserCommand, FollowUserUseCase } from '@crafty/crafty/application/usecases/follow-user.usecase';
import { PostMessageCommand, PostMessageUseCase } from '@crafty/crafty/application/usecases/post-message.usecase';
import { ViewTimelineUseCase } from '@crafty/crafty/application/usecases/view-timeline.usecase';
import { ViewWallUseCase } from '@crafty/crafty/application/usecases/view-wall.usecase';
import { Command, CommandRunner } from 'nest-commander'
import { CLINestTimelinePresenter } from './cli.nest.timeline.presenter';

@Command({ name: 'post', arguments: '<user> <message>' })
class PostCommand extends CommandRunner {
  constructor(private readonly postMessageUseCase: PostMessageUseCase) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const postMessageCommand: PostMessageCommand = {
      id: `${Math.floor(Math.random() * 10000)}`,
      author: passedParams[0],
      text: passedParams[1]
    };

    try {
      const result = await this.postMessageUseCase.handle(postMessageCommand);
      if (result.isOk()) {
        console.log('✅ Message posté');
        process.exit(0);
      } else {
        console.error('❌ Message non posté. Erreur:', result.error);
        process.exit(1);
      }
    } catch (error) {
      console.log('❌ Message non posté. Erreur:', error);
      process.exit(1);

    }
  }

}

@Command({ name: 'edit', arguments: '<message-id> <message>' })
class EditCommand extends CommandRunner {
  constructor(private readonly editMessageUseCase: EditMessageUseCase) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const editMessageCommand: EditMessageCommand = {
      id: passedParams[0],
      text: passedParams[1]
    };

    try {
      const result = await this.editMessageUseCase.handle(editMessageCommand);

      if (result.isOk()) {
        console.log('✅ Message edité');
        process.exit(0);
      } else {
        console.log('❌ Message non edité. Erreur:', result.error);
        process.exit(1);
      }
    } catch (error) {
      console.log('❌ Message non edité. Erreur:', error);
      process.exit(1);

    }
  }
}

@Command({ name: 'follow', arguments: '<user> <user-to-follow>' })
class FollowCommand extends CommandRunner {
  constructor(private readonly followUserUseCase: FollowUserUseCase) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const followUserCommand: FollowUserCommand = {
      user: passedParams[0],
      userToFollow: passedParams[1]
    }

    try {
      await this.followUserUseCase.handle(followUserCommand);
      console.log('✅ User abonné');
    } catch (error) {
      console.log('❌ User non abonné. Erreur:', error);
    }
  }
}

@Command({ name: 'view', arguments: '<user>' })
class ViewCommand extends CommandRunner {
  constructor(private readonly viewTimelineUseCase: ViewTimelineUseCase, private readonly cliPresenter: CLINestTimelinePresenter) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    try {
      await this.viewTimelineUseCase.handle({ user: passedParams[0] }, this.cliPresenter);


      console.log('✅ Timeline dispo');
    } catch (error) {
      console.log('❌ Timeline non dispo. Erreur:', error);

    }
  }
}

@Command({ name: 'wall', arguments: '<user>' })
class WallCommand extends CommandRunner {
  constructor(private readonly viewWallUseCase: ViewWallUseCase, private readonly cliPresenter: CLINestTimelinePresenter) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    try {
      await this.viewWallUseCase.handle({ user: passedParams[0] }, this.cliPresenter);
      console.log('✅ Le wall a pu être visualisé');
    } catch (error) {
      console.log('❌ Le Wall ne peut pas être visualisé. Erreur:', error);
    }
  }
}

export const commands = [
  PostCommand,
  EditCommand,
  FollowCommand,
  ViewCommand,
  WallCommand
];


