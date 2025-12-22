export function maskSecret(secret: string): string {
  // Very short secrets get fully masked
  if (secret.length <= 8) {
    return "****";
  }
  // Show first 4 and last 4 characters
  const prefix = secret.slice(0, 4);
  const suffix = secret.slice(-4);
  return `${prefix}****${suffix}`;
}
export function maskLine(line: string, secret: string): string {
  // Replace the secret in the line with its masked version
  return line.replace(secret, maskSecret(secret));
}
export function getPreview(
  line: string,
  secret: string,
  maxLength = 60
): string {
  // Create a preview of the line with the secret masked
  const masked = maskLine(line.trim(), secret);

  if (masked.length <= maxLength) {
    return masked;
  }

  // Find position of masked secret and show context around it
  const maskedSecret = maskSecret(secret);
  const pos = masked.indexOf(maskedSecret);

  if (pos === -1) {
    return masked.slice(0, maxLength) + "...";
  }

  // Show context around the secret
  const start = Math.max(0, pos - 10);
  const end = Math.min(masked.length, pos + maskedSecret.length + 10);

  let preview = masked.slice(start, end);
  if (start > 0) preview = "..." + preview;
  if (end < masked.length) preview = preview + "...";

  return preview;
}
