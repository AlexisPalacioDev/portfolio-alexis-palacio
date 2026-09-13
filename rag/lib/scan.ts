export function scanForSecrets(text: string): boolean {
  const patterns = [
    /sk-[A-Za-z0-9]{20,}/,
    /AIza[0-9A-Za-z_-]{30,}/,
    /password\s*[:=]\s*\S+/i,
    // Private IPv4 ranges
    /\b10\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/,
    /\b192\.168\.\d{1,3}\.\d{1,3}\b/,
    /\b172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}\b/,
    /\b100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\.\d{1,3}\.\d{1,3}\b/
  ];

  for (const pattern of patterns) {
    if (pattern.test(text)) {
      return true; // Match found
    }
  }

  return false;
}
