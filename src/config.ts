import path from 'path';
import dotenv from 'dotenv';

dotenv.config({path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`)});

class Config {
  // Application
  public NODE_ENV: string = process.env.NODE_ENV || 'development';
  public PORT: number = parseInt(process.env.PORT || '4002', 10);

  public CLIENT_URL: string = process.env.CLIENT_URL || 'http://localhost:3000';
  public API_GATEWAY_URL: string = process.env.API_GATEWAY_URL || 'http://localhost:4000';

  // Admin
  public ADMIN_USERNAME: string = process.env.ADMIN_USERNAME || 'admin';
  public ADMIN_PASSWORD: string = process.env.ADMIN_PASSWORD || 'password';
  public ADMIN_EMAIL: string = process.env.ADMIN_EMAIL || 'admin@example.com';

  // Vault
  public VAULT_KEY_NAME: string = process.env.VAULT_KEY_NAME || 'jwt-signing-key';
  public VAULT_URL: string = process.env.VAULT_URL || 'http://127.0.0.1:8200';
  public VAULT_TOKEN: string = process.env.VAULT_TOKEN || 'root';

  // Database
  public DATABASE_URL: string = process.env.DATABASE_URL || 'mysql://joblance:joblance@localhost:3306/joblance_auth';

  // Messaging
  public RABBITMQ_URL: string = process.env.RABBITMQ_URL || 'amqp://joblance:joblance@localhost:5672';
  public REDIS_URL: string = process.env.REDIS_URL || 'redis://localhost:6379';

  // JWT
  public JWT_ALGORITHM: string = process.env.JWT_ALGORITHM || 'RS256';
  public REFRESH_TOKEN_SECRET: string = process.env.REFRESH_TOKEN_SECRET || 'supersecretrefreshkey';
  public ACCESS_TOKEN_EXPIRES_IN: string = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
  public REFRESH_TOKEN_EXPIRES_IN: string = process.env.REFRESH_TOKEN_EXPIRES_IN || '604800';
  public EMAIL_VERIFICATION_TOKEN_EXPIRES_IN: string = process.env.EMAIL_VERIFICATION_TOKEN_EXPIRES_IN || '600';

  // Gateway internal JWT
  public GATEWAY_SECRET_KEY: string = process.env.GATEWAY_SECRET_KEY || 'gateway-key';

  // APM
  public ENABLE_APM: boolean = process.env.ENABLE_APM === '1';
  public ELASTIC_APM_SERVER_URL: string = process.env.ELASTIC_APM_SERVER_URL || 'http://localhost:8200';
  public ELASTIC_APM_SECRET_TOKEN: string = process.env.ELASTIC_APM_SECRET_TOKEN || '';
}

export const config = new Config();
