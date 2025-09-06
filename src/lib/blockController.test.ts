import { describe, it, expect } from 'vitest';
import { parseFlags, updateBlockConfig, type Block } from './blockController';

describe('parseFlags', () => {
  it('stringifies objects', () => {
    const json = parseFlags({ a: 1, b: true });
    expect(json).toBe('{"a":1,"b":true}');
  });

  it('accepts JSON strings', () => {
    const json = parseFlags('{"x":5}');
    expect(json).toBe('{"x":5}');
  });

  it('returns null for nullish', () => {
    expect(parseFlags(null)).toBeNull();
    expect(parseFlags(undefined)).toBeNull();
  });

  it('throws for invalid input', () => {
    expect(() => parseFlags(5 as unknown as object)).toThrow();
  });
});

describe('updateBlockConfig', () => {
  it('applies parsed flags to block', () => {
    const block: Block = { id: '1', config_json: null };
    const updated = updateBlockConfig(block, { enabled: true });
    expect(updated.config_json).toBe('{"enabled":true}');
  });
});
