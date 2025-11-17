import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

import { User } from '../database/models/user.model';

export const seedUsers = async (req: Request, res: Response) => {
  try {
    const count = req.query.count ? parseInt(req.query.count as string) : 50;
    const usersToInsert = [];
    const hashedPassword = await bcrypt.hash('password123', 10); // Common password for seeded users

    for (let i = 0; i < count; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      usersToInsert.push({
        id: uuidv4(),
        username: faker.internet.username({ firstName, lastName }),
        email: faker.internet.email({ firstName, lastName, provider: 'example.com' }),
        password: hashedPassword,
        isVerified: true,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    const createdUsers = await User.bulkCreate(usersToInsert);

    return res.status(201).json({ message: `${count} users seeded successfully`, users: createdUsers });
  } catch (error) {
    console.error('User seeding failed:', error);
    return res.status(500).json({ message: 'Failed to seed users', error });
  }
};

export const deleteSeededUsers = async (_req: Request, res: Response) => {
  try {
    const deletedCount = await User.destroy({
      where: {
        email: {
          [Op.like]: '%@example.com%',
        },
      },
    });

    return res.status(200).json({ message: `${deletedCount} seeded users deleted successfully` });
  } catch (error) {
    console.error('User deletion failed:', error);
    return res.status(500).json({ message: 'Failed to delete seeded users', error });
  }
};
