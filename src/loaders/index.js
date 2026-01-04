import expressLoader from './express.js';
import dbLoader from './db.js';
import containerLoader from './container.js';

export default async ({ expressApp }) => {
  const db = await dbLoader();
  const container = await containerLoader(db);
  await expressLoader({ app: expressApp, container });

  return {
    db,
    container,
  };
};