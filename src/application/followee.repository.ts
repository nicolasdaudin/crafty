export type Followee = {
  user: string,
  followee: string
}

export interface FolloweeRepository {
  getFolloweesOf(name: string): Promise<string[] | []>;
  saveFollowee(followee: Followee): Promise<void>
}