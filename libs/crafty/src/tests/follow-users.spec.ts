import { FollowingFixture, createFollowingFixture } from "./followee.fixture";

describe('Feature : Follow a user', () => {
  let fixture: FollowingFixture;
  beforeEach(() => {
    fixture = createFollowingFixture();
  })

  describe('Rule: a user can follow another user', () => {
    test('Alice already follows Charlie and now wants to follow Bob', async () => {
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


    test('Alice has no followees and now wants to follow Bob', async () => {
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

  describe('Rule: a user can not follow twice the same user', () => {
    test('Alice already follows Bob. Nothing changes when she requests following Bob again', async () => {
      await fixture.givenUserFollowees({
        user: 'Alice',
        followees: ['Bob']
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




