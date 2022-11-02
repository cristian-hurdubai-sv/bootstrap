/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { errorHandler, PluginDatabaseManager } from '@backstage/backend-common';
import express from 'express';
import fetch from 'cross-fetch';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { DatabaseRandowUserStore } from '../database';
import { RawUser } from '../database/types';

export interface RouterOptions {
  logger: Logger;
  database: PluginDatabaseManager;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger } = options;
  const router = Router();
  router.use(express.json());

  const dbHandler: DatabaseRandowUserStore = await DatabaseRandowUserStore.create(options.database);

  router.put('/get-random-users', async (_, response) => {
    const results = await fetch('https://randomuser.me/api/?results=50');
    const data = await results.json();
    // response.send(data.results);
    await dbHandler.transaction( async tx => {
      await dbHandler.insert(tx, data.results as RawUser[]);
    })
    response.send(data.results);
  });

  router.get('/get-all', async (_, response) => {
    const data = await dbHandler.getAll();
    response.send(data);
  });

  router.get('/users', async (req, response) => {
    try {
      const options = req.query;
      const data = await dbHandler.getAllByFilter(options);
      response.send(data);
    } catch (err) {
      response.status(500).send({status: 'nok', message: "An error has occured"});
    }
  });

  router.get('/users/:id', async (req, response) => {
    try {
      const userId: string = req.params.id || "";
      const data = await dbHandler.get(userId);
      response.send(data);
    } catch (err) {
      response.status(404).send({status: 'nok', message: "User not found"});
    }
  });

  router.delete('/users/:id', async (req, response) => {
    try {
      const userId: string = req.params.id || "";
      await dbHandler.delete(userId);
      response.status(204).send();
    } catch (err) {
      response.status(404).send({status: 'nok', message: "User not found"});
    }
  });


  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.send({ status: 'ok' });
  });
  router.use(errorHandler());
  return router;
}
