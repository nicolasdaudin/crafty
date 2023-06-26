import * as path from "path";
import * as fs from 'fs';
import { Followee } from "../followee";
import { FolloweeRepository } from "../followee.repository";



export class FileSystemFolloweeRepository implements FolloweeRepository {
  constructor(private readonly filePath = path.join(__dirname, 'followees.json')) { }

  async getFolloweesOf(name: string): Promise<string[] | []> {
    const followeesInFile = await this.getFollowees();
    return followeesInFile[name] ?? [];
  }

  async saveFollowee(followee: Followee): Promise<void> {
    const followeesInFile = await this.getFollowees();//?
    const found = followeesInFile[followee.user];
    if (!found) {
      followeesInFile[followee.user] = [followee.followee]
    } else {
      if (!(found.includes(followee.followee))) {
        found.push(followee.followee);
      }
    }

    console.log(followeesInFile);

    await fs.promises.writeFile(this.filePath, JSON.stringify(followeesInFile));

  }

  private async getFollowees() {
    const data = await fs.promises.readFile(this.filePath);
    return JSON.parse(data.toString()) as { [user: string]: string[] }

  }

}