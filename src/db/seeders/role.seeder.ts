// import { database } from '@auth/db/database';
// import { Role } from '@auth/db/models/role.model';

// const seedRoles = async () => {
//   try {
//     await database.sequelizeInstance.authenticate();
//     await database.sequelizeInstance.sync();

//     const roles = [
//       { name: 'admin', description: 'Administrator role' },
//       { name: 'user', description: 'Default user role' },
//     ];

//     for (const role of roles) {
//       await Role.findOrCreate({
//         where: { name: role.name },
//         defaults: role,
//       });
//     }

//     await database.sequelizeInstance.close();
//     console.log('✅ Seeded roles successfully!');
//   } catch (error) {
//     console.error('❌ Error seeding roles:', error);
//     process.exit(1);
//   }
// };
