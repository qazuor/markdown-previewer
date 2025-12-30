import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Get encryption key from environment
 * Falls back to a derived key from BETTER_AUTH_SECRET if TOKEN_ENCRYPTION_KEY is not set
 */
function getEncryptionKey(): Buffer {
    const envKey = process.env.TOKEN_ENCRYPTION_KEY;
    if (envKey) {
        // If key is provided, derive a proper 32-byte key from it
        return scryptSync(envKey, 'markview-token-encryption', KEY_LENGTH);
    }

    // Fallback: derive from BETTER_AUTH_SECRET
    const authSecret = process.env.BETTER_AUTH_SECRET;
    if (!authSecret) {
        throw new Error('TOKEN_ENCRYPTION_KEY or BETTER_AUTH_SECRET must be set');
    }

    return scryptSync(authSecret, 'markview-token-encryption-fallback', KEY_LENGTH);
}

/**
 * Encrypt a string value (like an OAuth token)
 * Returns a base64-encoded string containing: salt + iv + tag + ciphertext
 */
export function encryptToken(plaintext: string): string {
    if (!plaintext) {
        throw new Error('Cannot encrypt empty value');
    }

    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);
    const salt = randomBytes(SALT_LENGTH);

    // Derive a unique key for this encryption using the salt
    const derivedKey = scryptSync(key, salt, KEY_LENGTH);

    const cipher = createCipheriv(ALGORITHM, derivedKey, iv);

    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);

    const tag = cipher.getAuthTag();

    // Combine: salt (32) + iv (16) + tag (16) + ciphertext
    const combined = Buffer.concat([salt, iv, tag, encrypted]);

    return combined.toString('base64');
}

/**
 * Decrypt an encrypted token
 * Expects base64-encoded string containing: salt + iv + tag + ciphertext
 */
export function decryptToken(encryptedBase64: string): string {
    if (!encryptedBase64) {
        throw new Error('Cannot decrypt empty value');
    }

    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedBase64, 'base64');

    // Extract components
    const salt = combined.subarray(0, SALT_LENGTH);
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const ciphertext = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    // Derive the same key using the salt
    const derivedKey = scryptSync(key, salt, KEY_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, derivedKey, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

    return decrypted.toString('utf8');
}

/**
 * Check if a value is encrypted (starts with expected base64 pattern)
 * This is a heuristic check, not a guarantee
 */
export function isEncrypted(value: string): boolean {
    if (!value) return false;

    try {
        const buffer = Buffer.from(value, 'base64');
        // Minimum size: salt (32) + iv (16) + tag (16) + at least 1 byte of ciphertext
        return buffer.length >= SALT_LENGTH + IV_LENGTH + TAG_LENGTH + 1;
    } catch {
        return false;
    }
}

/**
 * Safely encrypt a token, returning original if already encrypted or if encryption fails
 */
export function safeEncryptToken(plaintext: string | null | undefined): string | null {
    if (!plaintext) return null;

    // Check if already encrypted
    if (isEncrypted(plaintext)) {
        return plaintext;
    }

    try {
        return encryptToken(plaintext);
    } catch (error) {
        console.error('Failed to encrypt token:', error);
        return plaintext;
    }
}

/**
 * Safely decrypt a token, returning original if not encrypted or if decryption fails
 */
export function safeDecryptToken(encrypted: string | null | undefined): string | null {
    if (!encrypted) return null;

    // Check if it looks encrypted
    if (!isEncrypted(encrypted)) {
        return encrypted;
    }

    try {
        return decryptToken(encrypted);
    } catch (error) {
        console.error('Failed to decrypt token:', error);
        return encrypted;
    }
}
