export class MessageTooLongError extends Error { }
export class MessageEmptyError extends Error { }

export class Message {

  constructor(
    private readonly _id: string,
    private readonly _author: string,
    private _text: MessageText,
    private readonly _publishedAt: Date) { }

  get id() {
    return this._id
  }

  get author() {
    return this._author;
  }

  get text() {
    return this._text;
  }

  get publishedAt() {
    return this._publishedAt
  }

  editText(text: string) {
    this._text = MessageText.of(text);
  }

  get data(): { id: string; author: string; text: string; publishedAt: Date } {
    return {
      id: this.id,
      author: this.author,
      text: this.text.value,
      publishedAt: this._publishedAt
    }
  }

  static fromData({ id, author, text, publishedAt }: { id: string, author: string, text: string, publishedAt: Date }): Message {
    return new Message(
      id,
      author,
      MessageText.of(text),
      publishedAt
    );
  }


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
