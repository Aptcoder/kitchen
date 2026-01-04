import express from 'express';
import { getTestDb } from './testDb.js';
import containerLoader from '../../src/loaders/container.js';
import expressLoader from '../../src/loaders/express.js';

export const createTestApp = async () => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const db = await getTestDb();
  const container = await containerLoader(db);
  await expressLoader({ app, container });

  return app;
};

