import {Umzug, SequelizeStorage} from 'umzug';

import {database} from './connection';

export const migrator = new Umzug({
  migrations: {
    glob: ['./migrations/*.js', {cwd: __dirname}],
  },
  context: database.sequelizeInstance,
  storage: new SequelizeStorage({sequelize: database.sequelizeInstance, tableName: 'migrations'}),
  logger: console,
});

export const seeder = new Umzug({
  migrations: {
    glob: ['./seeders/*.js', {cwd: __dirname}],
  },
  context: database.sequelizeInstance,
  storage: new SequelizeStorage({sequelize: database.sequelizeInstance, tableName: 'seeders'}),
  logger: console,
});

export type Migration = typeof migrator._types.migration;
export type Seeder = typeof seeder._types.migration;
