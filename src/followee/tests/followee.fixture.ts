import { FollowUserCommand, FollowUserUseCase } from "../follow-user.usecase";
import { InMemoryFolloweeRepository } from "../followee.inmemory.repository";

export const createFollowingFixture = () => {
  const followeeRepository = new InMemoryFolloweeRepository();
  const followUserUseCase = new FollowUserUseCase(followeeRepository);
  let thrownError: Error;

  return {
    async givenUserFollowees({ user, followees }: { user: string, followees: string[] }) {
      // console.log(user, followees);
      await followeeRepository.givenExistingFollowees(followees.map(followee => ({ user: user, followee })));
      // const _followees = await followeeRepository.getFolloweesOf(user)
      // console.log(_followees)
    },
    async whenUserFollows(followUserCommand: FollowUserCommand) {
      await followUserUseCase.handle(followUserCommand);
    },
    async thenUserFolloweesAre(expectedUserFollowees: { user: string, followees: string[] }) {
      const actualFollowees = await followeeRepository.getFolloweesOf(expectedUserFollowees.user);
      expect(actualFollowees).toEqual(expectedUserFollowees.followees);
    },
    followeeRepository

  }
}

export type FollowingFixture = ReturnType<typeof createFollowingFixture>