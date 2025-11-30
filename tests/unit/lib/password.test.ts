import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../../../src/lib/server/password';

describe('Password Hashing', () => {
	describe('hashPassword', () => {
		it('should create a hash with correct format', async () => {
			const password = 'testPassword123';
			const hash = await hashPassword(password);

			expect(hash).toMatch(/^pbkdf2:\d+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/);
		});

		it('should create different hashes for same password (unique salt)', async () => {
			const password = 'testPassword123';
			const hash1 = await hashPassword(password);
			const hash2 = await hashPassword(password);

			expect(hash1).not.toBe(hash2);
		});

		it('should handle empty password', async () => {
			const hash = await hashPassword('');
			expect(hash).toMatch(/^pbkdf2:\d+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/);
		});

		it('should handle unicode passwords', async () => {
			const password = '密码テスト🔐';
			const hash = await hashPassword(password);
			expect(hash).toMatch(/^pbkdf2:\d+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/);
		});

		it('should handle very long passwords', async () => {
			const password = 'a'.repeat(1000);
			const hash = await hashPassword(password);
			expect(hash).toMatch(/^pbkdf2:\d+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/);
		});
	});

	describe('verifyPassword', () => {
		it('should verify correct password', async () => {
			const password = 'testPassword123';
			const hash = await hashPassword(password);

			const result = await verifyPassword(hash, password);
			expect(result).toBe(true);
		});

		it('should reject incorrect password', async () => {
			const password = 'testPassword123';
			const hash = await hashPassword(password);

			const result = await verifyPassword(hash, 'wrongPassword');
			expect(result).toBe(false);
		});

		it('should reject similar but different passwords', async () => {
			const password = 'testPassword123';
			const hash = await hashPassword(password);

			const result = await verifyPassword(hash, 'testPassword124');
			expect(result).toBe(false);
		});

		it('should handle empty password verification', async () => {
			const hash = await hashPassword('');
			expect(await verifyPassword(hash, '')).toBe(true);
			expect(await verifyPassword(hash, 'notEmpty')).toBe(false);
		});

		it('should handle unicode password verification', async () => {
			const password = '密码テスト🔐';
			const hash = await hashPassword(password);

			expect(await verifyPassword(hash, password)).toBe(true);
			expect(await verifyPassword(hash, '密码テスト')).toBe(false);
		});

		it('should reject invalid hash format', async () => {
			const result = await verifyPassword('invalidhash', 'password');
			expect(result).toBe(false);
		});

		it('should reject hash with wrong prefix', async () => {
			const result = await verifyPassword('bcrypt:100000:salt:hash', 'password');
			expect(result).toBe(false);
		});

		it('should reject hash with missing parts', async () => {
			const result = await verifyPassword('pbkdf2:100000:salt', 'password');
			expect(result).toBe(false);
		});
	});

	describe('hash/verify roundtrip', () => {
		const testCases = [
			'simple',
			'with spaces in password',
			'UPPERCASE',
			'MixedCase123',
			'special!@#$%^&*()',
			'unicode: émojis 🔒',
			'very-long-' + 'password'.repeat(50)
		];

		testCases.forEach((password) => {
			it(`should roundtrip: "${password.substring(0, 30)}..."`, async () => {
				const hash = await hashPassword(password);
				const verified = await verifyPassword(hash, password);
				expect(verified).toBe(true);
			});
		});
	});
});
