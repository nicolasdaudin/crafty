import { PostMessageCommand, PostMessageUseCase } from '@crafty/crafty/application/usecases/post-message.usecase';
import { Body, Controller, Get, Post, Query, Res, Response } from '@nestjs/common';
import * as httpErrors from 'http-errors';
import { FastifyReply } from 'fastify';
import { EditMessageCommand, EditMessageUseCase } from '@crafty/crafty/application/usecases/edit-message.usecase';
import { FollowUserCommand, FollowUserUseCase } from '@crafty/crafty/application/usecases/follow-user.usecase';
import { ViewTimelineUseCase } from '@crafty/crafty/application/usecases/view-timeline.usecase';
import { ApiTimelinePresenter } from '@crafty/crafty/apps/timeline.api.presenter';
import { ViewWallUseCase } from '@crafty/crafty/application/usecases/view-wall.usecase';

@Controller()
export class ApiController {
  constructor(
    private readonly postMessageUseCase: PostMessageUseCase,
    private readonly editMessageUseCase: EditMessageUseCase,
    private readonly followUserUseCase: FollowUserUseCase,
    private readonly viewTimelineUseCase: ViewTimelineUseCase,
    private readonly viewWallUseCase: ViewWallUseCase) { }

  @Post('/post')
  async postMessage(@Body() body: { user: string, message: string }, @Res() reply: FastifyReply) {

    const postMessageCommand: PostMessageCommand = {
      id: `${Math.floor(Math.random() * 10000)}`,
      author: body.user,
      text: body.message
    };

    try {
      // await postMessageUseCase.handle(postMessageCommand);
      // console.log('✅ Message posté');
      // reply.status(201)

      const result = await this.postMessageUseCase.handle(postMessageCommand);
      if (result.isOk()) {
        reply.status(201).send();
        return;
      }
      console.log('❌ Message non posté. Bad Request. Erreur:', result.error);
      reply.send(httpErrors[400](result.error.message))
    } catch (err) {
      console.log('❌ Message non posté. Unexpected error. Erreur:', err);
      reply.send(httpErrors[500](err));
    }
  }

  @Post('/edit')
  async editMessage(@Body() body: { messageId: string, message: string }, @Res() reply: FastifyReply) {

    const editMessageCommand: EditMessageCommand = {
      id: body.messageId,
      text: body.message
    };

    try {
      const result = await this.editMessageUseCase.handle(editMessageCommand);
      if (result.isOk()) {
        reply.status(200).send();
        return;
      }
      reply.send(httpErrors[403](result.error.message));

    } catch (err) {
      console.log('❌ Message non edité. Erreur:', err);
      reply.send(httpErrors[500](err));
    }
  }

  @Post('/follow')
  async followUser(@Body() body: { user: string, userToFollow: string }, @Res() reply: FastifyReply) {
    const followUserCommand: FollowUserCommand = {
      user: body.user,
      userToFollow: body.userToFollow
    }

    try {
      await this.followUserUseCase.handle(followUserCommand);
      console.log('✅ User abonné');
      reply.status(201).send()

    } catch (err) {
      console.log('❌ User non abonné. Erreur:', err);
      reply.send(httpErrors[500](err));
    }
  }

  @Get('/view')
  async viewTimeline(
    @Query() query: { user: string },
    @Res() reply: FastifyReply) {
    try {
      const apiTimelinePresenter = new ApiTimelinePresenter(reply);
      await this.viewTimelineUseCase.handle({ user: query.user }, apiTimelinePresenter);

    } catch (err) {
      reply.send(httpErrors[500](err));
    }
  }

  @Get('/wall')
  async viewWall(
    @Query() query: { user: string },
    @Res() reply: FastifyReply) {
    try {
      const apiTimelinePresenter = new ApiTimelinePresenter(reply);
      await this.viewWallUseCase.handle({ user: query.user }, apiTimelinePresenter);

    } catch (err) {
      reply.send(httpErrors[500](err));
    }
  }
}
