import { describe, it, expect } from 'vitest';
import { calculateOneRepMax, parseVoiceCommand } from '../utils';

describe('calculateOneRepMax', () => {
  it('calculates 1RM using Epley formula', () => {
    expect(calculateOneRepMax(100, 10)).toBeCloseTo(133.333, 3);
  });
});

describe('parseVoiceCommand', () => {
  it('parses weight and reps from command', () => {
    const result = parseVoiceCommand('Bench press, 60 kilos for 8 reps');
    expect(result).toEqual({
      type: 'log_set',
      exerciseName: 'Bench press',
      weight: 60,
      reps: 8,
      exerciseId: 1,
      setNumber: 1,
    });
  });
});
