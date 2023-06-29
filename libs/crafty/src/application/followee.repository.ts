import { Injectable } from "@nestjs/common";

export type Followee = {
  user: string,
  followee: string
}

@Injectable()
export abstract class FolloweeRepository {
  abstract getFolloweesOf(name: string): Promise<string[] | []>;
  abstract saveFollowee(followee: Followee): Promise<void>
}