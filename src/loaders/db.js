import knex from 'knex';

export default async () => {
  const db = knex({
    client: 'pg',
    connection: process.env.DATABASE_URL,
  });

  return db;
};