import { AuthenticationFailedError, BadRequestError, ConflictError, EmailNotVerifiedError, ErrorCode, JsonWebTokenError, NotFoundError } from '@hiep20012003/joblance-shared';
import { User } from '@auth/db/models/user.model';
import { AppLogger } from '@auth/utils/logger';
import { EmailVerificationToken } from '@auth/db/models/email-verification-token.model';
import { ResendEmailVerificationDTO, SignInDTO, SignUpDTO, VerifyEmailDTO } from '@auth/dtos/auth/auth-request.schema';
import { AuthResponseDTO, UserResponseDTO } from '@auth/dtos/auth/auth-response.dto';
import { UserRepository } from '@auth/repositories/user.repository';
import { EmailTokenRepository } from '@auth/repositories/email-token.repository';
import { RefreshTokenRepository } from '@auth/repositories/refresh-token.repository';
import { config } from '@auth/config';
import bcrypt from 'bcrypt';

import { EmailService } from './email.service';
import { TokenService } from './token.service';

export class AuthService {
  constructor(
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
    private readonly emailTokenRepository: EmailTokenRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository
  ) {}

  public async signUp(payload: SignUpDTO): Promise<UserResponseDTO> {
    if (payload.password !== payload.confirmPassword)
      throw new BadRequestError({
        clientMessage: 'Passwords do not match',
        operation: 'auth-signup',
        errorCode: ErrorCode.BAD_REQUEST,
        context: { email: payload.email }
      });

    const user = await this.userRepository.findByEmail(payload.email);
    if (user) {
      throw new ConflictError({
        clientMessage: 'Email already exists',
        logMessage: `Attempted to create duplicate email: ${payload.email}`,
        operation: 'auth-signup',
        errorCode: ErrorCode.RESOURCE_CONFLICT,
        context: { email: payload.email }
      });

    }

    const newUser: User = new User({
      username: payload.username,
      email: payload.email,
      password: payload.password,
    });
    await this.userRepository.save(newUser);

    const emailVerificationToken: EmailVerificationToken = await this.tokenService.generateEmailVerificationToken(newUser.id, config.EMAIL_VERIFICATION_TOKEN_EXPIRES_SECONDS as number);
    await this.emailService.sendEmailVerification(newUser.id, newUser.username, newUser.email, emailVerificationToken.token);

    const userDTO = new UserResponseDTO(newUser.id,
      newUser.username,
      newUser.email,
      newUser.is_verified,
      newUser.status
    );

    AppLogger.info(`User created successfully with id: ${newUser.id}`, {
      operation: 'auth-signup',
      metadata: { userId: newUser.id, email: newUser.email, username: newUser.username }
    });


    return userDTO;
  }

  public async signIn(payload: SignInDTO): Promise<AuthResponseDTO> {
    const user = await this.userRepository.findByEmail(payload.email);
    if (!user) {
      throw new NotFoundError({
        clientMessage: 'User not exists',
        logMessage: `User not exist with email: ${payload.email}`,
        operation: 'auth-signin',
        errorCode: ErrorCode.NOT_FOUND,
        context: { email: payload.email }
      });

    }

    const isMatch = await bcrypt.compare(payload.password, user.password);

    if (!isMatch) {
      throw new AuthenticationFailedError({
        clientMessage: 'Invalid email or password',
        logMessage: `Failed login attempt for email: ${payload.email}`,
        operation: 'auth-signin',
        errorCode: ErrorCode.AUTHENTICATION_FAILED,
        context: { email: payload.email },
      });
    }

    if (!user.is_verified) {
      throw new EmailNotVerifiedError({
        clientMessage: 'Please verify your email before signing in',
        context: { userId: user.id, email: user.email },
        operation: 'auth-signin',
      });
    }


    AppLogger.info(`User signed in successfully with id: ${user.id}`, {
      operation: 'auth-signin',
      metadata: { userId: user.id, email: user.email }
    });

    const { accessToken, refreshToken } = await this.tokenService.generateAndSaveAuthTokens(user);

    const userDTO = new UserResponseDTO(user.id, user.username, user.email, user.is_verified, user.status);

    return new AuthResponseDTO(accessToken, refreshToken, userDTO);
  }

  public async refreshAccessToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const decodedToken = this.tokenService.verifyToken<{ sub: string }>(token);

    const oldRefreshToken = await this.refreshTokenRepository.findByToken(token);
    if (!oldRefreshToken || oldRefreshToken.revoked) {
      throw new JsonWebTokenError({
        clientMessage: 'Invalid or revoked refresh token.',
        errorCode: ErrorCode.TOKEN_INVALID
      });
    }

    // Revoke the old refresh token
    await this.refreshTokenRepository.revokeToken(token);

    const user = await this.userRepository.findById(decodedToken.sub);
    if (!user) {
      throw new NotFoundError({
        clientMessage: 'User for this token not found.',
        errorCode: ErrorCode.NOT_FOUND
      });
    }

    // Generate a new pair of tokens and save the new refresh token
    const { accessToken, refreshToken: newRefreshToken } = await this.tokenService.generateAndSaveAuthTokens(user);

    return { accessToken, refreshToken: newRefreshToken };
  }

  public async logout(token: string): Promise<void> {
    const refreshToken = await this.refreshTokenRepository.findByToken(token);
    if (refreshToken) {
      await this.refreshTokenRepository.revokeToken(token);
    }
  }

  public async resendEmailVerification(payload: ResendEmailVerificationDTO): Promise<void> {
    const user = await this.userRepository.findByEmail(payload.email);
    if (!user) {
      throw new NotFoundError({
        clientMessage: 'User not found',
        logMessage: `User not found with email: ${payload.email}`,
        operation: 'auth-resend-email-verification',
        errorCode: ErrorCode.NOT_FOUND,
        context: { email: payload.email }
      });

    }

    if (user.is_verified) {
      throw new ConflictError({
        clientMessage: 'Email has already been verified',
        logMessage: `Email ${payload.email} has already been verified`,
        operation: 'auth-resend-email-verification',
        errorCode: ErrorCode.RESOURCE_CONFLICT,
        context: { userId: user.id, email: user.email }
      });

    }

    const emailVerificationToken: EmailVerificationToken = await this.tokenService.generateEmailVerificationToken(user.id, 300);
    await this.emailService.sendEmailVerification(user.id, user.username, user.email, emailVerificationToken.token);
  }

  public async verifyEmail(payload: VerifyEmailDTO): Promise<void> {
    const emailVerificationToken = await this.emailTokenRepository.findByToken(payload.token);
    if (!emailVerificationToken) {
      throw new NotFoundError({
        clientMessage: 'Email verification token not found',
        operation: 'auth-verify-email',
        errorCode: ErrorCode.NOT_FOUND,
        context: { token: payload.token }
      });
    }
    if (emailVerificationToken.used)
    {
      throw new ConflictError({
        clientMessage: 'Token already used',
        operation: 'auth-verify-email',
        errorCode: ErrorCode.RESOURCE_CONFLICT,
        context: { tokenId: emailVerificationToken.id, userId: emailVerificationToken.user_id }
      });

    }

    const user = await this.userRepository.findById(emailVerificationToken.user_id);

    if (!user) {
      throw new NotFoundError({
        clientMessage: 'User not found',
        operation: 'auth-verify-email',
        errorCode: ErrorCode.NOT_FOUND,
        context: { userId: emailVerificationToken.user_id }
      });

    }

    if (user.is_verified) return;

    await this.emailTokenRepository.markTokenAsUsed(emailVerificationToken.id);
    await this.userRepository.updateEmailVerified(user.id, true);

    AppLogger.info(`Verify email successfully with user id: ${user.id}`, {
      operation: 'auth-verify-email',
      metadata: { userId: user.id, email: user.email }
    });
  }
}
