import { Sequelize } from 'sequelize';
import { AppLogger } from '@auth/utils/logger';
import { config } from '@auth/config';
import { ServerError } from '@hiep20012003/joblance-shared';

import { User } from './models/user.model';
import { Role } from './models/role.model';
import { UsersRoles } from './models/users-roles.model';
import { RefreshToken } from './models/refresh-token.model';
import { PasswordResetToken } from './models/password-reset-token.model';
import { EmailVerificationToken } from './models/email-verification-token.model';
import { Permission } from './models/permission.model';
import { Resource } from './models/resource.model';

export class Database {
  private readonly sequelize: Sequelize;
  private isConnected = false;

  constructor() {
    this.sequelize = new Sequelize(`${config.DATABASE_URL}`, {
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

    User.initialize(this.sequelize);
    Role.initialize(this.sequelize);
    UsersRoles.initialize(this.sequelize);
    RefreshToken.initialize(this.sequelize);
    PasswordResetToken.initialize(this.sequelize);
    EmailVerificationToken.initialize(this.sequelize);
    Permission.initialize(this.sequelize);
    Resource.initialize(this.sequelize);

    this.setupAssociations();
  }

  private setupAssociations() {
    // User ↔ Role (many-to-many)
    User.belongsToMany(Role, { through: UsersRoles, foreignKey: 'userId', as: 'roles' });
    Role.belongsToMany(User, { through: UsersRoles, foreignKey: 'roleId', as: 'users' });

    // User ↔ RefreshToken (1-n)
    User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
    RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // User ↔ PasswordResetToken (1-n)
    User.hasMany(PasswordResetToken, { foreignKey: 'userId', as: 'passwordResetTokens' });
    PasswordResetToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // User ↔ EmailVerificationToken (1-n)
    User.hasMany(EmailVerificationToken, { foreignKey: 'userId', as: 'emailVerificationTokens' });
    EmailVerificationToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // Role ↔ Resource (many-to-many through Permission)
    Role.belongsToMany(Resource, { through: Permission, foreignKey: 'roleId', as: 'resources' });
    Resource.belongsToMany(Role, { through: Permission, foreignKey: 'resourceId', as: 'roles' });

    // Role ↔ Permission (1-n)
    Role.hasMany(Permission, { foreignKey: 'roleId', as: 'permissions' });
    Permission.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

    // Resource ↔ Permission (1-n)
    Resource.hasMany(Permission, { foreignKey: 'resourceId', as: 'permissions' });
    Permission.belongsTo(Resource, { foreignKey: 'resourceId', as: 'resource' });

  }

  public async connect(): Promise<void> {
    try {
      if (this.isConnected) {
        AppLogger.info('Database connection already established.', { operation: 'database-connect' });
        return;
      }
      await this.sequelize.authenticate();
      this.isConnected = true;
      AppLogger.info('Database connection has been established successfully.', { operation: 'database-connect' });
    } catch (error) {
      throw new ServerError({
        logMessage: 'Unable to connect to the database',
        cause: error,
        operation: 'database-connect'
      });
    }
  }

  public async close(): Promise<void> {
    try {
      if (!this.isConnected) {
        AppLogger.info('Database connection is not established.', { operation: 'database-close' });
        return;
      }
      await this.sequelize.close();
      this.isConnected = false;
      AppLogger.info('Database connection has been closed successfully.', { operation: 'database-close' });
    } catch (error) {
      throw new ServerError({
        logMessage: 'Unable to close the database connection',
        cause: error,
        operation: 'database-close'
      });
    }
  }

  public get sequelizeInstance(): Sequelize {
    return this.sequelize;
  }
}

export const database = new Database();
export const dbContext = {
  sequelize: database.sequelizeInstance,
  User,
  Role,
  UserRole: UsersRoles,
  RefreshToken,
  PasswordResetToken,
  EmailVerificationToken,
};
