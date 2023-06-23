import { Followee } from "./followee";

export interface FolloweeRepository {
  getFolloweesOf(name: string): Promise<string[] | []>;
  saveFollowee(followee: Followee): Promise<void>
}