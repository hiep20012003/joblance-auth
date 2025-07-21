import { Sequelize } from 'sequelize';
import { AppLogger } from '@auth/utils/logger';
import { config } from '@auth/config';
import { ServerError } from '@hiep20012003/joblance-shared';

import { User } from './models/user.model';
import { UserProfile } from './models/user-profile.model';
import { Role } from './models/role.model';
import { UserRole } from './models/user-role.model';
import { RefreshToken } from './models/refresh-token.model';
import { PasswordResetToken } from './models/password-reset-token.model';
import { EmailVerificationToken } from './models/email-verification-token.model';

export class Database {
  private sequelize: Sequelize;
  private isConnected = false;

  constructor() {
    this.sequelize = new Sequelize({
      dialect: 'mysql',
      host: config.MYSQL_HOST as string,
      port: +(config.MYSQL_PORT as string),
      username: config.MYSQL_USER as string,
      password: config.MYSQL_PASSWORD as string,
      database: config.MYSQL_DATABASE as string,
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

    User.initialize(this.sequelize);
    UserProfile.initialize(this.sequelize);
    Role.initialize(this.sequelize);
    UserRole.initialize(this.sequelize);
    RefreshToken.initialize(this.sequelize);
    PasswordResetToken.initialize(this.sequelize);
    EmailVerificationToken.initialize(this.sequelize);

    this.setupAssociations();
  }

  private setupAssociations() {
    User.hasOne(UserProfile, { foreignKey: 'user_id', as: 'profile' });
    User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
    User.hasMany(EmailVerificationToken, { foreignKey: 'user_id', as: 'emailVerificationTokens' });
    User.hasMany(PasswordResetToken, { foreignKey: 'user_id', as: 'passwordResetTokens' });

    User.belongsToMany(Role, {
      through: UserRole,
      foreignKey: 'user_id',
      otherKey: 'role_id',
      as: 'roles',
    });

    Role.belongsToMany(User, {
      through: UserRole,
      foreignKey: 'role_id',
      otherKey: 'user_id',
      as: 'users',
    });

    RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    PasswordResetToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    EmailVerificationToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    UserProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    UserRole.belongsTo(User, { foreignKey: 'user_id' });
    UserRole.belongsTo(Role, { foreignKey: 'role_id' });
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
export const db = {
  // sequelize: database.sequelizeInstance,
  User,
  UserProfile,
  Role,
  UserRole,
  RefreshToken,
  PasswordResetToken,
  EmailVerificationToken,
};
