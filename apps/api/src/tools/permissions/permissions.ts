/**
 * CivicPulse Granular Tool Permissions
 * Least-privilege permission tokens for autonomous operations.
 */
export type ToolPermission =
  | 'tools:vision:analyze'
  | 'tools:vision:classify'
  | 'tools:location:geocode'
  | 'tools:location:read'
  | 'tools:duplicate:search'
  | 'tools:duplicate:text'
  | 'tools:severity:calculate'
  | 'tools:routing:read'
  | 'tools:routing:assign'
  | 'tools:investigation:read'
  | 'tools:operations:workorder'
  | 'tools:operations:update'
  | 'tools:verification:evaluate'
  | 'tools:incident:reopen'
  | 'tools:incident:close'
  | 'tools:notification:send'
  | 'tools:intelligence:read'
  | 'tools:incident:classify'
  | 'tools:location:update'
  | 'tools:duplicate:link'
  | 'tools:severity:set'
  | 'tools:incident:validate';
