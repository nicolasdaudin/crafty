import { FollowUserCommand, FollowUserUseCase } from "../follow-user.usecase";
import { InMemoryFolloweeRepository } from "../followee.inmemory.repository";

describe('Feature : Follow a user', () => {
  let fixture: Fixture;
  beforeEach(() => {
    fixture = createFixture();
  })

  describe('Rule: a user can follow another user', () => {
    test('Alice can follow Bob', async () => {
      fixture.givenUserFollowees({
        user: 'Alice',
        followees: ['Charlie']
      })

      await fixture.whenUserFollows({
        user: 'Alice',
        userToFollow: 'Bob'
      })

      fixture.thenUserFolloweesAre({
        user: 'Alice',
        followees: ['Charlie', 'Bob']
      })
    })
  });
});




const createFixture = () => {
  const followeeRepository = new InMemoryFolloweeRepository();
  const followUserUseCase = new FollowUserUseCase(followeeRepository);
  let thrownError: Error;

  return {

    givenUserFollowees({ user, followees }: { user: string, followees: string[] }) {
      followeeRepository.givenExistingFollowees(followees.map(followee => ({ user: user, followee })));
    },

    async whenUserFollows(followUserCommand: FollowUserCommand) {
      await followUserUseCase.handle(followUserCommand);

    },

    async thenUserFolloweesAre(expectedUserFollowees: { user: string, followees: string[] }) {
      const actualFollowees = await followeeRepository.getFolloweesOf(expectedUserFollowees.user);
      expect(actualFollowees).toEqual(expectedUserFollowees.followees);
    },

  }
}

type Fixture = ReturnType<typeof createFixture>