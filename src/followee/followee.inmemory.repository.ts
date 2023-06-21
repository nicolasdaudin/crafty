import { Followee } from "./followee";
import { FolloweeRepository } from "./followee.repository";

export class InMemoryFolloweeRepository implements FolloweeRepository {
  followeesByUser = new Map<string, string[]>();

  givenExistingFollowees(_followees: Followee[]) {
    _followees.forEach(fellowee => this.addFollowee(fellowee));
  }

  async getFolloweesOf(name: string) {
    return this.followeesByUser.get(name) ?? [];
  }

  async saveFollowee(followee: Followee): Promise<void> {
    this.addFollowee(followee);

    return Promise.resolve();
  }

  private addFollowee(followee: Followee) {
    const existingFollowees = this.followeesByUser.get(followee.user) ?? [];
    existingFollowees.push(followee.followee);
    this.followeesByUser.set(followee.user, existingFollowees);
  }
}