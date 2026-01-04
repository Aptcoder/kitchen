import bcrypt from 'bcrypt';

export async function seed(knex) {
  const hashedPassword = await bcrypt.hash('password123', 10);

  await knex('vendors').del();

  await knex('vendors').insert([
    {
      id: 1,
      name: 'Pizza Palace',
      email: 'pizza@palace.com',
      password: hashedPassword,
      address: '123 Main Street, New York, NY 10001',
      phone: '555-0101',
    },
    {
      id: 2,
      name: 'Burger Barn',
      email: 'info@burgerbarn.com',
      password: hashedPassword,
      address: '456 Oak Avenue, Los Angeles, CA 90001',
      phone: '555-0202',
    },
    {
      id: 3,
      name: 'Sushi Express',
      email: 'hello@sushiexpress.com',
      password: hashedPassword,
      address: '789 Pine Road, San Francisco, CA 94102',
      phone: '555-0303',
    },
    {
      id: 4,
      name: 'Taco Fiesta',
      email: 'contact@tacofiesta.com',
      password: hashedPassword,
      address: '321 Elm Street, Austin, TX 78701',
      phone: '555-0404',
    },
    {
      id: 5,
      name: 'Pasta Paradise',
      email: 'info@pastaparadise.com',
      password: hashedPassword,
      address: '654 Maple Drive, Chicago, IL 60601',
      phone: '555-0505',
    },
  ]);
}

