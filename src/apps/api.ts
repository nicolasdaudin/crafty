#!/usr/bin/env node

import { EditMessageCommand, EditMessageUseCase } from "../messaging/application/usecases/edit-message.usecase";
import { RealDateProvider } from "../messaging/infra/real-date-provider";
import { PostMessageCommand, PostMessageUseCase } from "../messaging/application/usecases/post-message.usecase";
import { ViewTimelineUseCase } from "../messaging/application/usecases/view-timeline.usecase";
import { FollowUserCommand, FollowUserUseCase } from "../followee/follow-user.usecase";
import { ViewWallUseCase } from "../wall/view-wall.usecase";
import { PrismaClient } from "@prisma/client";
import { PrismaMessageRepository } from "../infra/message.prisma.repository";
import { PrismaFolloweeRepository } from "../infra/followee.prisma.repository";
import Fastify, { FastifyInstance } from "fastify";
import * as httpErrors from 'http-errors';
import { ApiTimelinePresenter } from "./timeline.api.presenter";



const dateProvider = new RealDateProvider();

const prismaClient = new PrismaClient();
const messageRepository = new PrismaMessageRepository(prismaClient);
const followeeRepository = new PrismaFolloweeRepository(prismaClient);
const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);
const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository);
const editMessageUseCase = new EditMessageUseCase(messageRepository);
const followUserUseCase = new FollowUserUseCase(followeeRepository);
const viewWallUseCase = new ViewWallUseCase(messageRepository, followeeRepository);

const fastify = Fastify({ logger: true });

const routes = async (fastifyInstance: FastifyInstance) => {
  fastifyInstance.post<{ Body: { user: string, message: string } }>('/post', {}, async (request, reply) => {
    const postMessageCommand: PostMessageCommand = {
      id: `${Math.floor(Math.random() * 10000)}`,
      author: request.body.user,
      text: request.body.message
    };

    try {
      await postMessageUseCase.handle(postMessageCommand);
      console.log('✅ Message posté');
      reply.status(201)

    } catch (err) {
      console.log('❌ Message non posté. Erreur:', err);
      reply.send(httpErrors[500](err));
    }
  });

  fastifyInstance.post<{ Body: { id: string, message: string } }>('/edit', {}, async (request, reply) => {
    const editMessageCommand: EditMessageCommand = {
      id: request.body.id,
      text: request.body.message
    };

    try {
      await editMessageUseCase.handle(editMessageCommand);
      console.log('✅ Message edité');
      reply.status(201)

    } catch (err) {
      console.log('❌ Message non edité. Erreur:', err);
      reply.send(httpErrors[500](err));
    }
  });

  fastifyInstance.post<{ Body: { user: string, userToFollow: string } }>('/follow', {}, async (request, reply) => {
    const followUserCommand: FollowUserCommand = {
      user: request.body.user,
      userToFollow: request.body.userToFollow
    }

    try {
      await followUserUseCase.handle(followUserCommand);
      console.log('✅ User abonné');
      reply.status(201)

    } catch (err) {
      console.log('❌ User non abonné. Erreur:', err);
      reply.send(httpErrors[500](err));
    }
  });

  fastifyInstance.get<{
    Querystring: { user: string };
    Reply:
    | { author: string, text: string, publicationTime: string }[]
    | httpErrors.HttpError<500>;
    Body: { user: string, userToFollow: string }
  }>('/view', {}, async (request, reply) => {
    try {
      const apiTimelinePresenter = new ApiTimelinePresenter(reply);
      await viewTimelineUseCase.handle({ user: request.query.user }, apiTimelinePresenter);

    } catch (err) {
      reply.send(httpErrors[500](err));
    }
  });

  fastifyInstance.get<{
    Querystring: { user: string };
    Reply:
    | { author: string, text: string, publicationTime: string }[]
    | httpErrors.HttpError<500>;
    Body: { user: string, userToFollow: string }
  }>('/wall', {}, async (request, reply) => {
    try {
      const apiTimelinePresenter = new ApiTimelinePresenter(reply);
      await viewWallUseCase.handle({ user: request.query.user }, apiTimelinePresenter);


    } catch (err) {
      reply.send(httpErrors[500](err));
    }
  });


}

fastify.register(routes);
fastify.addHook('onClose', async () => {
  await prismaClient.$disconnect();
});

async function main() {
  try {
    await prismaClient.$connect();
    await fastify.listen({ port: 3030 })

  } catch (error) {
    fastify.log.error(error);
    await prismaClient.$disconnect();
  }
}
main();

