// Export shared types and base classes
export * from './shared/types';
export { BaseAgent } from './shared/base-agent';
export { SecureBaseAgent } from './shared/secure-base-agent';

// Export authentication and security utilities
export * from './shared/auth';

// Export specific agent implementations
export { CustomerAgent } from './customer/customer-agent';
export { AdminAgent } from './admin/admin-agent';

// Export secure agent implementations
export { SecureCustomerAgent } from './customer/secure-customer-agent';
export { SecureAdminAgent } from './admin/secure-admin-agent';

// Import for factory functions
import { SecureCustomerAgent } from './customer/secure-customer-agent';
import { SecureAdminAgent } from './admin/secure-admin-agent';
import { CustomerAgent } from './customer/customer-agent';
import { AdminAgent } from './admin/admin-agent';

// Export factory functions for creating secure agents
export function createCustomerAgent(config?: any) {
  return new SecureCustomerAgent(config);
}

export function createAdminAgent(config?: any) {
  return new SecureAdminAgent(config);
}

// Export legacy agents for backward compatibility
export function createLegacyCustomerAgent() {
  return new CustomerAgent();
}

export function createLegacyAdminAgent(config?: any) {
  return new AdminAgent();
}

