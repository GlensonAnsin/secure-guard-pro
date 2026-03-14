import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Op } from 'sequelize';
import User from '../models/User.js';
import Role from '../models/Role.js';
import UserRole from '../models/UserRole.js';
import RefreshToken from '../models/RefreshToken.js';
import Hash from '../utils/Hash.js';
import env from '../config/env.js';

class AuthService {
  /**
   * Get user roles as an array of slugs.
   */
  private async getUserRoles(userId: number): Promise<string[]> {
    const userRoles = await UserRole.findAll({
      where: { user_id: userId },
      include: [{ model: Role, as: 'role' }],
    });
    return userRoles.map((ur: any) => ur.role?.slug).filter(Boolean);
  }

  /**
   * Authenticate user and return access + refresh tokens.
   */
  public async login(username: string, password: string) {
    const user = await User.findOne({ where: { username } });

    if (!user || !(await Hash.check(password, user.password))) {
      throw new Error('Invalid credentials');
    }

    const roles = await this.getUserRoles(user.id);

    // Guards cannot log in via web
    if (roles.length === 1 && roles.includes('guard')) {
      throw new Error('Invalid credentials');
    }

    if (user.is_resigned) {
      throw new Error('This account is no longer active.');
    }

    const accessToken = this.generateAccessToken(user, roles);
    const refreshToken = await this.generateRefreshToken(user.id);

    const userResponse = user.toJSON();
    const { password: _, ...userWithoutPassword } = userResponse;

    return { user: { ...userWithoutPassword, roles }, accessToken, refreshToken };
  }

  /**
   * Authenticate guard user (mobile app) and return access + refresh tokens.
   */
  public async guardLogin(username: string, password: string) {
    const user = await User.findOne({ where: { username } });

    if (!user || !(await Hash.check(password, user.password))) {
      throw new Error('Invalid credentials');
    }

    const roles = await this.getUserRoles(user.id);

    if (!roles.includes('guard')) {
      throw new Error('Invalid credentials');
    }

    if (user.is_resigned) {
      throw new Error('This account is no longer active.');
    }

    const accessToken = this.generateAccessToken(user, roles);
    const refreshToken = await this.generateRefreshToken(user.id);

    const userResponse = user.toJSON();
    const { password: _, ...userWithoutPassword } = userResponse;

    return { user: { ...userWithoutPassword, roles }, accessToken, refreshToken };
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
      storedToken.revoked = true;
      await storedToken.save();
      throw new Error('Refresh token has expired');
    }

    const user = await User.findByPk(storedToken.user_id);
    if (!user) {
      throw new Error('User not found');
    }

    const roles = await this.getUserRoles(user.id);
    const accessToken = this.generateAccessToken(user, roles);

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
  private generateAccessToken(user: User, roles: string[]): string {
    return jwt.sign(
      { id: user.id, email: user.email, roles },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
    );
  }

  /**
   * Generate and store a long-lived refresh token.
   */
  private async generateRefreshToken(userId: number): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');

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
    if (!match) return 7 * 24 * 60 * 60 * 1000;

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

  /**
   * Change user password securely.
   */
  public async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!(await Hash.check(oldPassword, user.password))) {
      throw new Error('Incorrect current password');
    }

    user.password = newPassword;
    await user.save();

    return { success: true };
  }
}

export default new AuthService();