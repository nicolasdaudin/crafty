import { Followee } from "./followee";

export interface FolloweeRepository {
  getFolloweesOf(name: string);
  saveFollowee(followee: Followee): Promise<void>
}