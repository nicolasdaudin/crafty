import * as fs from 'fs';
import * as path from 'path';
import { FolloweeRepository } from './followee.repository';
import { Followee } from './followee';

export class FileUserRepository implements FolloweeRepository {
  constructor(private readonly filePath = path.join(__dirname, 'followees.json')) { }


  async getFolloweesOf(name: string) {
    // const users = await this.getFollowees();
    // return users.find(user => user.name === name)!;

  }

  async saveFollowee(_user: Followee): Promise<void> {
    // const users = await this.getFollowees();
    // const existingUserIndex = users.findIndex(user => user.name === _user.name)
    // if (existingUserIndex > -1) {
    //   users[existingUserIndex] = _user
    // } else {
    //   users.push(_user);
    // }
    // await fs.promises.writeFile(this.filePath, JSON.stringify(users));
  }

  // private async getFollowees(): Promise<Followee[]> {
  //   const data = await fs.promises.readFile(this.filePath);
  //   const followees = JSON.parse(data.toString()) as { name: string, followees: string[] }[]

  //   return followees.map(f => ({user: f.name,followee:f.followees});
  // }
}