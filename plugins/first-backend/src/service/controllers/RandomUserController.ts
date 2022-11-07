import { RouterOptions } from '../router';
import { DatabaseRandowUserStore } from '../../database';
import { RandomUserRow, RawUser } from '../../database/types';
import fetch from 'cross-fetch';

export class RandomUserController {
  private constructor(
    private options: RouterOptions,
    private dbHandler: DatabaseRandowUserStore,
  ) {
    this.getUsers = this.getUsers.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.getRandomUsers = this.getRandomUsers.bind(this);
    this.addUser = this.addUser.bind(this);
  }

  public static async fromConfig(options: RouterOptions) {
    const dbHandler = await DatabaseRandowUserStore.create(options.database);
    return new RandomUserController(options, dbHandler);
  }

  public async getUsers(req, response, _) {
    try {
      const userId: string = req.params.id || '';
      let data: RandomUserRow | RandomUserRow[];
      if (userId) {
        data = await this.dbHandler.get(userId);
      } else {
        data = await this.dbHandler.getAllByFilter(req.query);
      }
      response.send(data);
    } catch (err) {
      response
        .status(500)
        .send({ status: 'nok', message: 'An error has occured' });
    }
  }

  public async getRandomUsers(_, response) {
    try {
      const results = await fetch('https://randomuser.me/api/?results=50');
      const data = await results.json();
      await this.dbHandler.transaction(async tx => {
        await this.dbHandler.insert(tx, data.results as RawUser[]);
      });
      response.send(data.results);
    } catch (err) {
      response
        .status(500)
        .send({ status: 'nok', message: 'An error has occured' });
    }
  }

  public async deleteUser(req, response, _) {
    try {
      console.log('GGG');
      const userId: string = req.params.id || '';
      await this.dbHandler.delete(userId);
      response.status(204).send();
    } catch (err) {
      response.status(404).send({ status: 'nok', message: 'User not found' });
    }
  }

  public async addUser(req, response, _) {
    // we should get a same data structure as when getting random users
    const rawUsers = [req.body];

    try {
      await this.dbHandler.transaction(async tx => {
        await this.dbHandler.insert(tx, rawUsers as RawUser[]);
      });
    } catch (err) {
      response
        .status(500)
        .send({ status: 'nok', message: 'An error has occured' });
    }
  }
}
