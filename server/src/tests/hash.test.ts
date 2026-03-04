import { describe, it, expect } from 'vitest';
import Hash from '../utils/Hash.js';

describe('Hash Utility', () => {
  it('should hash a plain text string', async () => {
    const hash = await Hash.make('password123');
    expect(hash).toBeDefined();
    expect(hash).not.toBe('password123');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('should return true for matching password', async () => {
    const plain = 'mySecretPassword';
    const hash = await Hash.make(plain);
    const result = await Hash.check(plain, hash);
    expect(result).toBe(true);
  });

  it('should return false for non-matching password', async () => {
    const hash = await Hash.make('correctPassword');
    const result = await Hash.check('wrongPassword', hash);
    expect(result).toBe(false);
  });

  it('should produce different hashes for the same input (due to salt)', async () => {
    const hash1 = await Hash.make('password');
    const hash2 = await Hash.make('password');
    expect(hash1).not.toBe(hash2);
  });
});
