import { IAuthDocument } from '@hiep20012003/joblance-shared';

export interface TokenDTO {
  token: string;
  exp: number;
}

export interface AuthResponseDTO {
  accessToken: TokenDTO;
  refreshToken: TokenDTO;
  user: IAuthDocument;
}
