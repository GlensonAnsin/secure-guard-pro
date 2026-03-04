import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import Hash from '../utils/Hash.js';
import env from '../config/env.js';

class AuthService {
  /**
   * Authenticate user and return access + refresh tokens.
   */
  public async login(email: string, password: string) {
    const user = await User.findOne({ where: { email } });

    if (!user || !(await Hash.check(password, user.password))) {
      throw new Error('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    const userResponse = user.toJSON();
    const { password: _, ...userWithoutPassword } = userResponse;

    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  /**
   * Issue a new access token from a valid refresh token.
   */
  public async refresh(token: string) {
    const storedToken = await RefreshToken.findOne({
      where: { token, revoked: false },
    });

    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }

    if (new Date() > storedToken.expires_at) {
      // Revoke expired token
      storedToken.revoked = true;
      await storedToken.save();
      throw new Error('Refresh token has expired');
    }

    const user = await User.findByPk(storedToken.user_id);
    if (!user) {
      throw new Error('User not found');
    }

    const accessToken = this.generateAccessToken(user);

    return { accessToken };
  }

  /**
   * Revoke a refresh token (logout).
   */
  public async logout(token: string) {
    const storedToken = await RefreshToken.findOne({
      where: { token, revoked: false },
    });

    if (storedToken) {
      storedToken.revoked = true;
      await storedToken.save();
    }
  }

  /**
   * Generate a short-lived access token.
   */
  private generateAccessToken(user: User): string {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
    );
  }

  /**
   * Generate and store a long-lived refresh token.
   */
  private async generateRefreshToken(userId: number): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');

    // Parse refresh token expiry to milliseconds
    const expiresIn = this.parseExpiry(env.JWT_REFRESH_EXPIRES_IN);
    const expiresAt = new Date(Date.now() + expiresIn);

    await RefreshToken.create({
      user_id: userId,
      token,
      expires_at: expiresAt,
    });

    return token;
  }

  /**
   * Parse a duration string like '7d', '24h', '30m' to milliseconds.
   */
  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([dhms])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 days

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'd': return value * 24 * 60 * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'm': return value * 60 * 1000;
      case 's': return value * 1000;
      default: return 7 * 24 * 60 * 60 * 1000;
    }
  }
}

export default new AuthService();