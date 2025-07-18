import { Umzug, SequelizeStorage } from 'umzug';

import { database } from './database';

export const migrator = new Umzug({
  migrations: {
    glob: ['./migrations/*.ts', { cwd: __dirname }],
  },
  context: database.sequelizeInstance,
  storage: new SequelizeStorage({ sequelize: database.sequelizeInstance, tableName: 'migrations' }),
  logger: console,
});

export type Migration = typeof migrator._types.migration;
