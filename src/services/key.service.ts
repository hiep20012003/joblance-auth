import { config } from '@auth/config';
import {
  base64ToBase64Url,
  DependencyError,
  ErrorCode,
  IVaultKeyDataResponse,
  IVaultSignResponse,
  ServerError
} from '@hiep20012003/joblance-shared';
import axios, { AxiosResponse } from 'axios';
import * as jwk from 'pem-jwk';
import jwt from 'jsonwebtoken';
import { AppLogger } from '@auth/utils/logger';

export class KeyService {
  public static createVaultKeyIfNotExist = async (key: string): Promise<void> => {
    const operation = 'auth:create-vault-key';

    try {
      const response: AxiosResponse<IVaultKeyDataResponse> = await axios.get(
        `${config.VAULT_URL}/v1/transit/keys/${key}`,
        { headers: { 'X-Vault-Token': config.VAULT_TOKEN } }
      );

      if (response.data?.data?.latest_version) {
        AppLogger.info('Vault key already exists', { operation, context: { key } });
        return;
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status !== 404) {
        throw new DependencyError({
          clientMessage: 'Cannot check Vault key',
          logMessage: `Vault check key failed: ${(error as Error).message}`,
          operation,
          errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
          cause: error
        });
      }
    }

    try {
      await axios.post(
        `${config.VAULT_URL}/v1/transit/keys/${key}`,
        { type: 'rsa-2048', exportable: true },
        { headers: { 'X-Vault-Token': config.VAULT_TOKEN } }
      );

      AppLogger.info('Vault key created successfully', { operation, context: { key } });
    } catch (error: unknown) {
      throw new DependencyError({
        clientMessage: 'Cannot create Vault key',
        logMessage: `Vault create key failed: ${(error as Error).message}`,
        operation,
        errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
        cause: error
      });
    }
  };

  signJwtAccessToken = async (payload: object, expiresIn?: string | number): Promise<string> => {
    const operation = 'auth:sign-access-token';
    try {
      const now = Math.floor(Date.now() / 1000);
      const finalPayload = {
        ...payload,
        iat: now,
        exp: expiresIn ? now + (typeof expiresIn === 'number' ? expiresIn : parseInt(expiresIn)) : undefined
      };

      const header = {
        alg: config.JWT_ALGORITHM,
        typ: 'JWT',
        kid: `${config.VAULT_KEY_NAME}`
      };

      const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
      const payloadB64 = Buffer.from(JSON.stringify(finalPayload)).toString('base64url');

      const dataToSign = `${headerB64}.${payloadB64}`;
      const input = Buffer.from(dataToSign).toString('base64');

      const response: AxiosResponse<IVaultSignResponse> = await axios.post(
        `${config.VAULT_URL}/v1/transit/sign/${config.VAULT_KEY_NAME}/sha2-256`,
        { input: input, signature_algorithm: 'pkcs1v15' },
        { headers: { 'X-Vault-Token': config.VAULT_TOKEN } }
      );

      const signature: string = response.data.data.signature.replace(/^vault:v\d+:/, '');
      const keyVersion = response.data.data.key_version;
      const headerWithKeyVersionB64 = Buffer.from(
        JSON.stringify({ ...header, kid: `${config.VAULT_KEY_NAME}:${keyVersion}` })
      ).toString('base64url');

      const token = `${headerWithKeyVersionB64}.${payloadB64}.${base64ToBase64Url(signature)}`;

      AppLogger.info('Successfully signed access token via Vault', {
        operation,
        context: { keyId: config.VAULT_KEY_NAME, payloadKeys: Object.keys(payload) }
      });

      return token;
    } catch (error: unknown) {
      const logMessage = axios.isAxiosError(error)
        ? `Vault request failed: ${error.message}`
        : `Signing failed: ${(error as Error).message}`;

      if (axios.isAxiosError(error)) {
        throw new DependencyError({
          clientMessage: 'Cannot sign access token at the moment',
          logMessage,
          operation,
          errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
          cause: error.response?.data
        });
      }

      throw new ServerError({
        clientMessage: 'Cannot sign access token at the moment',
        logMessage,
        operation,
        errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
        cause: error
      });
    }
  };

  signJwtRefreshToken = (payload: object, expiresIn?: string | number): string => {
    try {
      const now = Math.floor(Date.now() / 1000);
      const finalPayload = {
        ...payload,
        iat: now,
        exp: expiresIn ? now + (typeof expiresIn === 'number' ? expiresIn : parseInt(expiresIn)) : undefined
      };

      const token = jwt.sign(finalPayload, `${config.REFRESH_TOKEN_SECRET}`, {
        algorithm: 'HS256'
      });

      return token;
    } catch (error: unknown) {
      throw new ServerError({
        clientMessage: 'Cannot generate refresh token',
        operation: 'auth:generate-refresh-token',
        errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
        cause: error
      });
    }
  };

  getJWKS = async () => {
    const response: AxiosResponse<IVaultKeyDataResponse> = await axios.get(
      `${config.VAULT_URL}/v1/transit/keys/${config.VAULT_KEY_NAME}`,
      {
        headers: { 'X-Vault-Token': config.VAULT_TOKEN }
      }
    );
    const { keys } = response.data.data;
    const jwks = {
      keys: Object.entries(keys).map(([version, data]: [string, { public_key: string }]) => {
        const pubJwk = jwk.pem2jwk(data.public_key);
        return {
          ...pubJwk,
          kid: `${config.VAULT_KEY_NAME}:${version}`,
          // kid: `${config.VAULT_KEY_NAME}`,
          alg: 'RS256',
          use: 'sig'
        };
      })
    };

    AppLogger.info('Get JWKS successfully', { operation: 'keys:get-jkws' });
    return jwks;
  };
}

export const keyService = new KeyService();
