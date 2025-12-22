export type Severity = "critical" | "high" | "medium" | "low";

export type SecretPattern = {
  id: string;
  name: string;
  regex: RegExp;
  severity: Severity;
  remediation: string;
};

export const PATTERNS: SecretPattern[] = [
  // AWS
  {
    id: "aws-access-key-id",
    name: "AWS Access Key ID",
    regex: /(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/,
    severity: "critical",
    remediation:
      "Use IAM roles or AWS Secrets Manager. Rotate this key immediately.",
  },
  {
    id: "aws-secret-access-key",
    name: "AWS Secret Access Key",
    regex:
      /(?:aws_secret_access_key|aws_secret_key|secret_access_key)[\s:="']+([A-Za-z0-9/+=]{40})/i,
    severity: "critical",
    remediation:
      "Never hardcode AWS secrets. Use environment variables or IAM roles.",
  },

  // GitHub
  {
    id: "github-personal-access-token",
    name: "GitHub Personal Access Token",
    regex: /ghp_[a-zA-Z0-9]{36}/,
    severity: "high",
    remediation: "Use GitHub Apps or fine-grained PATs with minimal scopes.",
  },
  {
    id: "github-oauth-token",
    name: "GitHub OAuth Access Token",
    regex: /gho_[a-zA-Z0-9]{36}/,
    severity: "high",
    remediation: "OAuth tokens should be stored server-side, never in code.",
  },
  {
    id: "github-app-token",
    name: "GitHub App Token",
    regex: /(?:ghu|ghs)_[a-zA-Z0-9]{36}/,
    severity: "high",
    remediation: "App tokens should be generated at runtime, not stored.",
  },
  {
    id: "github-refresh-token",
    name: "GitHub Refresh Token",
    regex: /ghr_[a-zA-Z0-9]{36}/,
    severity: "high",
    remediation: "Refresh tokens must be stored securely, never in code.",
  },

  // Stripe
  {
    id: "stripe-live-secret",
    name: "Stripe Live Secret Key",
    regex: /sk_live_[0-9a-zA-Z]{24,}/,
    severity: "critical",
    remediation: "Use environment variables. Rotate key in Stripe Dashboard.",
  },
  {
    id: "stripe-live-publishable",
    name: "Stripe Live Publishable Key",
    regex: /pk_live_[0-9a-zA-Z]{24,}/,
    severity: "medium",
    remediation:
      "Publishable keys are meant to be public, but avoid hardcoding.",
  },
  {
    id: "stripe-test-secret",
    name: "Stripe Test Secret Key",
    regex: /sk_test_[0-9a-zA-Z]{24,}/,
    severity: "low",
    remediation:
      "Test keys are safe but should still use environment variables.",
  },

  // Google Cloud
  {
    id: "gcp-service-account",
    name: "GCP Service Account Key",
    regex: /"type"\s*:\s*"service_account"/,
    severity: "critical",
    remediation:
      "Use Workload Identity or Secret Manager instead of key files.",
  },
  {
    id: "gcp-api-key",
    name: "Google API Key",
    regex: /AIza[0-9A-Za-z\-_]{35}/,
    severity: "high",
    remediation: "Restrict API key by referrer and API. Use server-side only.",
  },

  // Private Keys
  {
    id: "private-key-rsa",
    name: "RSA Private Key",
    regex: /-----BEGIN RSA PRIVATE KEY-----/,
    severity: "critical",
    remediation: "Never commit private keys. Use secrets management.",
  },
  {
    id: "private-key-openssh",
    name: "OpenSSH Private Key",
    regex: /-----BEGIN OPENSSH PRIVATE KEY-----/,
    severity: "critical",
    remediation: "Store SSH keys securely. Use ssh-agent or secrets manager.",
  },
  {
    id: "private-key-ec",
    name: "EC Private Key",
    regex: /-----BEGIN EC PRIVATE KEY-----/,
    severity: "critical",
    remediation: "Never commit private keys. Rotate immediately if exposed.",
  },

  // Generic
  {
    id: "generic-password",
    name: "Hardcoded Password",
    regex: /(?:password|passwd|pwd|secret)[\s]*[=:]+[\s]*["']([^"']{8,})["']/i,
    severity: "high",
    remediation: "Use environment variables or a secrets manager.",
  },
  {
    id: "generic-api-key",
    name: "Generic API Key",
    regex:
      /(?:api[_-]?key|apikey|api_secret)[\s]*[=:]+[\s]*["']?([a-zA-Z0-9_\-]{20,})["']?/i,
    severity: "medium",
    remediation: "Move API keys to environment variables.",
  },
  {
    id: "generic-token",
    name: "Generic Token",
    regex:
      /(?:auth[_-]?token|access[_-]?token|bearer)[\s]*[=:]+[\s]*["']?([a-zA-Z0-9_\-]{20,})["']?/i,
    severity: "medium",
    remediation: "Tokens should be stored securely, not in code.",
  },

  // Database
  {
    id: "mongodb-uri",
    name: "MongoDB Connection String",
    regex: /mongodb(?:\+srv)?:\/\/[^:]+:[^@]+@[^/]+/,
    severity: "high",
    remediation: "Use environment variables for database URIs.",
  },
  {
    id: "postgres-uri",
    name: "PostgreSQL Connection String",
    regex: /postgres(?:ql)?:\/\/[^:]+:[^@]+@[^/]+/,
    severity: "high",
    remediation: "Use environment variables for database credentials.",
  },

  // Services
  {
    id: "slack-token",
    name: "Slack Token",
    regex: /xox[baprs]-[0-9a-zA-Z]{10,48}/,
    severity: "high",
    remediation: "Rotate Slack token immediately. Use Slack app tokens.",
  },
  {
    id: "twilio-api-key",
    name: "Twilio API Key",
    regex: /SK[0-9a-fA-F]{32}/,
    severity: "high",
    remediation: "Use Twilio API Key SID with environment variables.",
  },
  {
    id: "sendgrid-api-key",
    name: "SendGrid API Key",
    regex: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/,
    severity: "high",
    remediation: "Rotate SendGrid key. Use environment variables.",
  },
  {
    id: "npm-token",
    name: "NPM Access Token",
    regex: /npm_[a-zA-Z0-9]{36}/,
    severity: "high",
    remediation: "Revoke and regenerate NPM token immediately.",
  },
];

export function getSeverityWeight(severity: Severity): number {
  switch (severity) {
    case "critical":
      return 25;
    case "high":
      return 15;
    case "medium":
      return 8;
    case "low":
      return 3;
  }
}
