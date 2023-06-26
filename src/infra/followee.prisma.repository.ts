import { PrismaClient } from "@prisma/client";
import { Followee } from "../followee/followee";
import { FolloweeRepository } from "../followee/followee.repository";

export class PrismaFolloweeRepository implements FolloweeRepository {
  constructor(private readonly prisma: PrismaClient) { }

  async saveFollowee(followee: Followee): Promise<void> {
    // First create user if non existent
    await this.upsertUser(followee.user);
    await this.upsertUser(followee.followee);

    await this.prisma.user.update({
      where: { name: followee.user },
      data: {
        following: {
          // TODO: check if 'connect' only could be enough? or maybe with 'connectOrCreate' we don't need to upsertUser first ... 
          connectOrCreate: [{
            where: { name: followee.followee },
            create: { name: followee.followee }
          }]
        }
      }
    })
  }

  async getFolloweesOf(name: string): Promise<string[] | []> {
    const theUser = await this.prisma.user.findFirstOrThrow(
      {
        where: { name },
        include: { following: true }
      })

    return theUser.following.map(f => f.name)
  }

  private async upsertUser(user: string) {
    await this.prisma.user.upsert({
      where: { name: user },
      create: { name: user },
      update: { name: user }
    })
  }

}