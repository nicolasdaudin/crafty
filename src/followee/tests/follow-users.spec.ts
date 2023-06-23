import { FollowingFixture, createFollowingFixture } from "./followee.fixture";

describe('Feature : Follow a user', () => {
  let fixture: FollowingFixture;
  beforeEach(() => {
    fixture = createFollowingFixture();
  })

  describe('Rule: a user can follow another user', () => {
    test('Alice can follow Bob', async () => {
      await fixture.givenUserFollowees({
        user: 'Alice',
        followees: ['Charlie']
      })

      await fixture.whenUserFollows({
        user: 'Alice',
        userToFollow: 'Bob'
      })

      await fixture.thenUserFolloweesAre({
        user: 'Alice',
        followees: ['Charlie', 'Bob']
      })
    })
  });

  describe('Rule: a user with no followeee can follow another user', () => {
    test('Alice can follow Bob', async () => {
      await fixture.givenUserFollowees({
        user: 'Alice',
        followees: []
      })

      await fixture.whenUserFollows({
        user: 'Alice',
        userToFollow: 'Bob'
      })

      await fixture.thenUserFolloweesAre({
        user: 'Alice',
        followees: ['Bob']
      })
    })
  });
});




