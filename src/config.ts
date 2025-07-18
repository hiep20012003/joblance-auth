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
  }
}

export const config: Config = new Config();
