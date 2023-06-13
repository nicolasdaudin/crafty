describe('Feature: Posting a message', () => {
  describe('Rule: A message can contain a maximum of 280 characters', () => {
    test("Alice can post a message on her timeline", () => {
      givenNowIs(new Date('2023-06-08T12:51:00Z'));

      whenUserPostsAMessage({
        id: 'message-id', text: 'Hello World', author: 'Alice'
      });

      thenPostedMessageShouldBe({
        id: 'message-id', text: 'Hello World', author: 'Alice',
        publishedAt: new Date('2023-06-08T12:51:00Z')
      })

    })
  })
})

let message: { id: string, text: string, author: string, publishedAt: Date }
let now: Date;

function givenNowIs(_now: Date) {
  now = _now
}

function whenUserPostsAMessage(postMessageCommand: { id: string; text: string; author: string; }) {
  message = {
    id: postMessageCommand.id,
    text: postMessageCommand.text,
    author: postMessageCommand.author,
    publishedAt: now
  }

}

function thenPostedMessageShouldBe(expected: { id: string; text: string; author: string; publishedAt: Date; }) {
  expect(expected).toEqual(message)
}

