import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import { generateAccessToken, generateRefreshToken, hashRefreshToken } from '../utils/jwt';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors';
import { RegisterRequest, LoginRequest, AuthTokens, UserProfile } from '@EVNuvora/shared';

const SALT_ROUNDS = 10;

export class AuthService {
  static async register(input: RegisterRequest): Promise<{ user: UserProfile; tokens: AuthTokens }> {
    const existing = await query('SELECT id FROM users WHERE email = $1', [input.email.toLowerCase()]);
    if (existing.rows.length > 0) {
      throw new ConflictError('A user with this email already exists');
    }

    if (input.phone) {
      const phoneExists = await query('SELECT id FROM users WHERE phone = $1', [input.phone]);
      if (phoneExists.rows.length > 0) {
        throw new ConflictError('A user with this phone number already exists');
      }
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    await query('BEGIN');
    try {
      const userRes = await query(
        `INSERT INTO users (email, phone, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, phone, role, is_verified, created_at`,
        [input.email.toLowerCase(), input.phone || null, passwordHash, input.role || 'driver']
      );
      const user = userRes.rows[0];

      await query(
        `INSERT INTO user_profiles (user_id, full_name)
         VALUES ($1, $2)`,
        [user.id, input.fullName]
      );

      const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
      const { token: refreshToken, hash: refreshHash } = generateRefreshToken();

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, refreshHash, expiresAt]
      );

      await query('COMMIT');

      return {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          fullName: input.fullName,
          avatarUrl: null,
          role: user.role,
          isVerified: user.is_verified,
          createdAt: user.created_at,
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 900, // 15 mins
        },
      };
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  }

  static async login(input: LoginRequest): Promise<{ user: UserProfile; tokens: AuthTokens }> {
    const userRes = await query(
      `SELECT u.id, u.email, u.phone, u.password_hash, u.role, u.is_verified, u.is_active, u.created_at,
              p.full_name, p.avatar_url
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       WHERE u.email = $1`,
      [input.email.toLowerCase()]
    );

    if (userRes.rows.length === 0) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const user = userRes.rows[0];
    if (!user.is_active) {
      throw new UnauthorizedError('Account has been deactivated');
    }

    const passwordMatch = await bcrypt.compare(input.password, user.password_hash);
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const { token: refreshToken, hash: refreshHash } = generateRefreshToken();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, refreshHash, expiresAt]
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.full_name || '',
        avatarUrl: user.avatar_url || null,
        role: user.role,
        isVerified: user.is_verified,
        createdAt: user.created_at,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 900,
      },
    };
  }

  static async refreshToken(oldRefreshToken: string): Promise<AuthTokens> {
    const tokenHash = hashRefreshToken(oldRefreshToken);
    const tokenRes = await query(
      `SELECT r.id, r.user_id, r.expires_at, r.revoked_at, u.email, u.role, u.is_active
       FROM refresh_tokens r
       JOIN users u ON u.id = r.user_id
       WHERE r.token_hash = $1`,
      [tokenHash]
    );

    if (tokenRes.rows.length === 0) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const tokenRow = tokenRes.rows[0];
    if (tokenRow.revoked_at || new Date() > new Date(tokenRow.expires_at)) {
      throw new UnauthorizedError('Refresh token expired or revoked');
    }

    if (!tokenRow.is_active) {
      throw new UnauthorizedError('Account has been deactivated');
    }

    // Revoke used refresh token (rotation)
    await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1', [tokenRow.id]);

    const newAccessToken = generateAccessToken({
      userId: tokenRow.user_id,
      email: tokenRow.email,
      role: tokenRow.role,
    });
    const { token: newRefreshToken, hash: newRefreshHash } = generateRefreshToken();

    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 30);

    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [tokenRow.user_id, newRefreshHash, newExpiresAt]
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900,
    };
  }

  static async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashRefreshToken(refreshToken);
    await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1', [tokenHash]);
  }
}
