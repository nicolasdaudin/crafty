export class MessageTooLongError extends Error { }
export class MessageEmptyError extends Error { }

export type Message = {
  id: string,
  text: MessageText,
  author: string,
  publishedAt: Date
}

export class MessageText {
  private constructor(readonly value: string) { }

  static of(text: string) {
    if (text.length > 280) {
      throw new MessageTooLongError()
    }

    if (text.trim().length === 0) {
      throw new MessageEmptyError()
    }
    return new MessageText(text);

  }
}
