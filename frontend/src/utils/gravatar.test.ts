import { describe, it, expect } from 'vitest';
import { gravatarUrl } from './gravatar';

/**
 * UNIT TEST: Gravatar Utility
 * This test verifies the logic of URL generation without mounting React components.
 * It sits at the base of the Testing Pyramid for maximum speed and reliability.
 */
describe('gravatarUrl Utility', () => {
  
  it('should return a valid Gravatar URL with SHA-256 hash', async () => {
    const email = 'test@example.com';
    const size = 100;

    const url = await gravatarUrl(email, size);

    // 1. Check the base domain and path
    expect(url).toContain('https://www.gravatar.com/avatar/');
    
    // 2. Check that the custom size is correctly appended as a query parameter
    expect(url).toContain(`s=${size}`);
    
    // 3. Check for default 'mp' (mystery person) and 'g' (rating) parameters
    expect(url).toContain('d=mp');
    expect(url).toContain('r=g');
  });

  it('should normalize the email (trim and lowercase) before hashing', async () => {
    // Both emails should produce the exact same hash
    const email1 = '  USER@Test.com  ';
    const email2 = 'user@test.com';

    const url1 = await gravatarUrl(email1);
    const url2 = await gravatarUrl(email2);

    expect(url1).toBe(url2);
  });

  it('should use the default size of 36 if none is provided', async () => {
    const email = 'test@example.com';
    const url = await gravatarUrl(email);

    expect(url).toContain('s=36');
  });

  it('should produce a hash string of 64 characters (SHA-256 standard)', async () => {
    const email = 'dev@taskmanager.com';
    const url = await gravatarUrl(email);
    
    // Extract the hash from the URL: .../avatar/{hash}?s=...
    const hashPart = url.split('/avatar/')[1]?.split('?')[0];
    
    expect(hashPart).toHaveLength(64);
    // Ensure it only contains hexadecimal characters
    expect(hashPart).toMatch(/^[a-f0-9]+$/);
  });
});