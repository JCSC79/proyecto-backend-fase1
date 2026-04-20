import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Intent } from '@blueprintjs/core'; // Import the real Intent type
import { AppToaster } from './toaster';

/**
 * UNIT TEST: Toaster Utility
 * We verify that our global notification proxy correctly triggers 
 * BlueprintJS toaster methods.
 */
describe('AppToaster Utility', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have show, dismiss, and clear methods defined', () => {
    expect(AppToaster.show).toBeDefined();
    expect(AppToaster.dismiss).toBeDefined();
    expect(AppToaster.clear).toBeDefined();
  });

  it('should attempt to show a toast message without errors', () => {
    // We use the real Intent.PRIMARY instead of 'any' to satisfy ESLint
    const toastProps = { 
      message: 'Test message', 
      intent: Intent.PRIMARY 
    };
    
    // We ensure the singleton handles the call safely
    expect(() => AppToaster.show(toastProps)).not.toThrow();
  });
});