/**
 * Utility for masking PII (Personally Identifiable Information) in logs
 */

export class PiiMasker {
  // Mask email addresses
  static maskEmail(email: string): string {
    if (!email) return email;
    const [local, domain] = email.split('@');
    if (!domain) return email;
    
    const maskedLocal = local.length <= 2 
      ? local 
      : local.charAt(0) + '*'.repeat(Math.max(2, local.length - 2)) + local.slice(-1);
    
    return `${maskedLocal}@${domain}`;
  }

  // Mask phone numbers
  static maskPhone(phone: string): string {
    if (!phone) return phone;
    if (phone.length <= 4) return phone;
    
    const lastFour = phone.slice(-4);
    return `***${lastFour}`;
  }

  // Mask usernames (keep first and last chars)
  static maskUsername(username: string): string {
    if (!username) return username;
    if (username.length <= 2) return username;
    
    return username.charAt(0) + '*'.repeat(username.length - 2) + username.slice(-1);
  }

  // Mask names (keep first letter)
  static maskName(name: string): string {
    if (!name) return name;
    if (name.length <= 1) return name;
    
    return name.charAt(0) + '*'.repeat(name.length - 1);
  }

  // Mask IDs (keep last 4 chars)
  static maskId(id: string): string {
    if (!id) return id;
    if (id.length <= 4) return id;
    
    return `****${id.slice(-4)}`;
  }

  // Mask JWT tokens (show only first and last 8 chars)
  static maskToken(token: string): string {
    if (!token) return token;
    if (token.length <= 16) return '***';
    
    return `${token.substring(0, 8)}...${token.substring(token.length - 8)}`;
  }

  // Mask sensitive data in objects
  static maskObject(obj: any, sensitiveFields: string[] = ['email', 'phone', 'password', 'token']): any {
    if (!obj || typeof obj !== 'object') return obj;
    
    const masked = { ...obj };
    
    for (const field of sensitiveFields) {
      if (masked[field]) {
        if (field === 'email') masked[field] = this.maskEmail(masked[field]);
        else if (field === 'phone') masked[field] = this.maskPhone(masked[field]);
        else if (field === 'token') masked[field] = this.maskToken(masked[field]);
        else masked[field] = '***';
      }
    }
    
    return masked;
  }

  // Mask sensitive data in strings (log messages)
  static maskString(message: string): string {
    // Mask emails
    message = message.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, (match) => 
      this.maskEmail(match)
    );
    
    // Mask phone numbers
    message = message.replace(/\b\+?[\d\s\-()]{10,}\b/g, (match) => 
      this.maskPhone(match)
    );
    
    return message;
  }
}
