import { Message } from "./message";

const MAX_MESSAGES_IN_TIMELINE = 5;


export class Timeline {
  constructor(
    private readonly messages: Message[],
    // private readonly now: Date
  ) { }

  get data() {
    this.messages.sort((msgA, msgB) => msgB.publishedAt.getTime() - msgA.publishedAt.getTime())


    return this.messages
      .slice(0, MAX_MESSAGES_IN_TIMELINE)
    // .map(({ author, text, publishedAt }) => ({
    //   author, text: text.value, publicationTime: this.publicationTime(this.now, publishedAt)
    // }));
  }

  // private publicationTime(now: Date, publishedAt: Date): string {
  //   const diff = now.getTime() - publishedAt.getTime();

  //   const minutes = Math.floor(diff / (60 * 1000));

  //   if (minutes < 1) {
  //     return 'less than a minute ago';
  //   };
  //   if (minutes < 2) {
  //     return '1 minute ago';
  //   }
  //   return `${minutes} minutes ago`
  // }
}