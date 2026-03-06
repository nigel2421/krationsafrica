import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';
import { firebaseConfig } from '@/firebase/config';

// Logic for phone normalization extracted from CartSidebar for testing
const normalizePhone = (phone: string) => {
  let cleaned = phone.trim().replace(/\s+/g, '').replace(/-/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('254') || cleaned.startsWith('256') || cleaned.startsWith('255')) return '+' + cleaned;
  if (cleaned.startsWith('0')) return '+254' + cleaned.substring(1);
  if (/^\d+$/.test(cleaned)) return '+254' + cleaned;
  return cleaned;
};

describe('Utility: cn (Tailwind Merger)', () => {
  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2 py-2', 'p-4')).toBe('p-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'active', false && 'hidden')).toBe('base active');
  });
});

describe('Business Logic: Phone Normalization', () => {
  it('should format Kenyan local numbers to international', () => {
    expect(normalizePhone('0712345678')).toBe('+254712345678');
  });

  it('should keep existing international formatting', () => {
    expect(normalizePhone('+254712345678')).toBe('+254712345678');
  });

  it('should handle Ugandan numbers', () => {
    expect(normalizePhone('256700000000')).toBe('+256700000000');
  });

  it('should handle Tanzanian numbers', () => {
    expect(normalizePhone('255700000000')).toBe('+255700000000');
  });

  it('should strip spaces and hyphens', () => {
    expect(normalizePhone('0712 345-678')).toBe('+254712345678');
  });
});

describe('App Integrity: Firebase Configuration', () => {
  it('should have a valid project ID', () => {
    expect(firebaseConfig.projectId).toBe('kreation254');
  });

  it('should have an API key defined', () => {
    expect(firebaseConfig.apiKey).toBeDefined();
    expect(firebaseConfig.apiKey.length).toBeGreaterThan(10);
  });
});
