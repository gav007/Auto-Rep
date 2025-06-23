export function calculateOneRepMax(weight: number, reps: number): number {
  // Epley formula: 1RM = weight * (1 + reps/30)
  return weight * (1 + reps / 30);
}

export function parseVoiceCommand(command: string): any {
  const regex = /(.+?),?\s*(\d+(?:\.\d+)?)\s*(?:kg|kilos?)\s*(?:for\s*)?(\d+)\s*(?:reps?)?/i;
  const match = command.match(regex);

  if (match) {
    return {
      type: 'log_set',
      exerciseName: match[1].trim(),
      weight: parseFloat(match[2]),
      reps: parseInt(match[3]),
      exerciseId: 1, // Placeholder
      setNumber: 1,
    };
  }

  return { type: 'unknown' };
}
