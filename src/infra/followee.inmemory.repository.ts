import { Followee, FolloweeRepository } from "../application/followee.repository";

export class InMemoryFolloweeRepository implements FolloweeRepository {
  followeesByUser = new Map<string, string[]>();
  id: number;

  constructor() {
    this.id = Math.floor(Math.random() * 1000000)
  }

  async givenExistingFollowees(_followees: Followee[]) {
    // await Promise.all(_followees.map(followee => this.addFollowee(followee)))
    for (const followee of _followees) {
      await this.addFollowee(followee);
    }
  }

  async getFolloweesOf(name: string): Promise<string[] | []> {
    return Promise.resolve(this.followeesByUser.get(name) ?? [])
  }

  async saveFollowee(followee: Followee): Promise<void> {
    await this.addFollowee(followee);
  }

  private async addFollowee(followee: Followee) {
    const existingFollowees = await this.getFolloweesOf(followee.user) as string[];
    if (existingFollowees.includes(followee.followee)) return;

    existingFollowees.push(followee.followee);
    this.followeesByUser.set(followee.user, existingFollowees);
  }
}