import * as path from "path";
import * as fs from 'fs';
import { FileSystemFolloweeRepository } from "../followee.file.repository";
import { Followee } from "../../application/followee.repository";

describe("FileSystemFolloweeRepository", () => {
  const testFilePath = path.join(__dirname, 'followee-test.json');

  beforeEach(async () => {
    await fs.promises.writeFile(testFilePath, JSON.stringify({}));
  })

  test("getFolloweesOf() returns the followees of a user", async () => {
    await fs.promises.writeFile(testFilePath, JSON.stringify({
      Alice: ['Bob', 'Charlie'],
      Charlie: ['Danna']
    }));

    const fileRepo = new FileSystemFolloweeRepository(testFilePath);

    const actualFollowees = await fileRepo.getFolloweesOf("Alice");

    const expectedFollowees = ["Bob", "Charlie"]
    expect(actualFollowees).toEqual(expectedFollowees);
  })

  test("getFolloweesOf() returns an empty array if the user has no followees", async () => {
    await fs.promises.writeFile(testFilePath, JSON.stringify({
      Alice: ['Bob', 'Charlie'],
      Bob: [],
    }));

    const fileRepo = new FileSystemFolloweeRepository(testFilePath);

    const actualFollowees = await fileRepo.getFolloweesOf("Bob");

    const expectedFollowees = []
    expect(actualFollowees).toEqual(expectedFollowees);
  })

  test("getFolloweesOf() returns an empty array if the user doesn't exist", async () => {
    await fs.promises.writeFile(testFilePath, JSON.stringify({
      Alice: ['Bob', 'Charlie']
    }));

    const fileRepo = new FileSystemFolloweeRepository(testFilePath);

    const actualFollowees = await fileRepo.getFolloweesOf("Bob");

    const expectedFollowees = []
    expect(actualFollowees).toEqual(expectedFollowees);
  })

  test("saveFollowee() saves a new followee to an existing user with one followee", async () => {
    // Arranging
    await fs.promises.writeFile(testFilePath, JSON.stringify({
      Alice: ['Bob'],
      Charlie: ['Danna']
    }));

    const newFollowee: Followee = { user: 'Alice', followee: 'Charlie' }

    // Acting
    const fileRepo = new FileSystemFolloweeRepository(testFilePath);
    await fileRepo.saveFollowee(newFollowee);

    // Asserting
    const data = await fs.promises.readFile(testFilePath);
    const followeesFromFile = JSON.parse(data.toString()) as { [user: string]: string[] };

    const actualFollowees = followeesFromFile['Alice'];
    const expectedFollowees = ['Bob', 'Charlie'];

    expect(actualFollowees).toEqual(expectedFollowees);
  })

  test("saveFollowee() saves a new followee to a non-existing user", async () => {
    // Arranging
    await fs.promises.writeFile(testFilePath, JSON.stringify({
      Charlie: ['Danna']
    }));

    const newFollowee: Followee = { user: 'Alice', followee: 'Bob' }

    // Acting
    const fileRepo = new FileSystemFolloweeRepository(testFilePath);
    await fileRepo.saveFollowee(newFollowee);

    // Asserting
    const data = await fs.promises.readFile(testFilePath);
    const followeesFromFile = JSON.parse(data.toString()) as { [user: string]: string[] };

    const actualFollowees = followeesFromFile['Alice'];
    const expectedFollowees = ['Bob'];

    expect(actualFollowees).toEqual(expectedFollowees);
  })

  test("saveFollowee() does not add a followee if it already exists for that user", async () => {
    // Arranging
    await fs.promises.writeFile(testFilePath, JSON.stringify({
      Alice: ['Bob'],
      Charlie: ['Danna']
    }));

    const newFollowee: Followee = { user: 'Alice', followee: 'Bob' }

    // Acting
    const fileRepo = new FileSystemFolloweeRepository(testFilePath);
    await fileRepo.saveFollowee(newFollowee);

    // Asserting
    const data = await fs.promises.readFile(testFilePath);
    const followeesFromFile = JSON.parse(data.toString()) as { [user: string]: string[] };

    const actualFollowees = followeesFromFile['Alice'];
    const expectedFollowees = ['Bob'];

    expect(actualFollowees).toEqual(expectedFollowees);
  })
})