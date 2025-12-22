export function calculateEntropy(str: string): number {
  if (str.length === 0) return 0;
  const freq: Record<string, number> = {};
  for (const char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }
  let entropy = 0;
  const len = str.length;
  for (const count of Object.values(freq)) {
    const probability = count / len;
    entropy -= probability * Math.log2(probability);
  }
  return entropy;
}

export function isHighEntropy(str: string, threshold = 4.5): boolean {
  if (str.length < 20) return false;
  return calculateEntropy(str) > threshold;
}

export function findHighEntropyStrings(line: string): string[] {
  // Match quoted strings or long alphanumeric sequences
  const patterns = [
    /["']([a-zA-Z0-9+/=_\-]{20,})["']/g, // Quoted strings
    /[a-zA-Z0-9+/=_\-]{30,}/g, // Long unquoted strings
  ];
  const results: string[] = [];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(line)) !== null) {
      const candidate = match[1] || match[0];
      if (isHighEntropy(candidate)) {
        results.push(candidate);
      }
    }
  }
  return results;
}
