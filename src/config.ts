import dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.ENVIRONMENT || 'dev'}` });

class Config {
  PORT: string | undefined;
  CLIENT_URL: string | undefined;
  MYSQL_HOST: string | undefined;
  MYSQL_PORT: string | undefined;
  MYSQL_USER: string | undefined;
  MYSQL_PASSWORD: string | undefined;
  MYSQL_DATABASE: string | undefined;
  RABBITMQ_ENDPOINT: string | undefined;
  RABBITMQ_AUTH_EXCHANGE: string | undefined;
  RABBITMQ_AUTH_ROUTINGKEY: string | undefined;
  API_GATEWAY_URL: string | undefined;
  EMAIL_VERIFICATION_TOKEN_EXPIRES_SECONDS: number | undefined;
  JWT_PRIVATE_KEY_PATH: string | undefined;
  JWT_PUBLIC_KEY_PATH: string | undefined;
  JWT_ALGORITHM: string;
  JWT_KEY_ID: string;
  JWT_ACCESS_TOKEN_EXPIRES_IN: string;
  JWT_REFRESH_TOKEN_EXPIRES_IN: string;

  constructor() {
    this.PORT = process.env.PORT;
    this.CLIENT_URL = process.env.CLIENT_URL;
    this.MYSQL_HOST = process.env.MYSQL_HOST;
    this.MYSQL_PORT = process.env.MYSQL_PORT;
    this.MYSQL_USER = process.env.MYSQL_USER;
    this.MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
    this.MYSQL_DATABASE = process.env.MYSQL_DATABASE;
    this.RABBITMQ_ENDPOINT = process.env.RABBITMQ_ENDPOINT;
    this.RABBITMQ_AUTH_ROUTINGKEY = process.env.RABBITMQ_AUTH_ROUTINGKEY;
    this.RABBITMQ_AUTH_EXCHANGE = process.env.RABBITMQ_AUTH_EXCHANGE;
    this.API_GATEWAY_URL = process.env.API_GATEWAY_URL;
    this.EMAIL_VERIFICATION_TOKEN_EXPIRES_SECONDS = +(process.env.EMAIL_VERIFICATION_TOKEN_EXPIRES_SECONDS || 300);
    this.JWT_PRIVATE_KEY_PATH = process.env.JWT_PRIVATE_KEY_PATH || 'keys/private/key.pem';
    this.JWT_PUBLIC_KEY_PATH = process.env.JWT_PUBLIC_KEY_PATH || 'keys/public/key.pem';
    this.JWT_ALGORITHM = process.env.JWT_ALGORITHM || 'RS256';
    this.JWT_KEY_ID = process.env.JWT_KEY_ID || 'default-key';
    this.JWT_ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m';
    this.JWT_REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d';
  }
}

export const config: Config = new Config();
