import { ToolDefinition } from '../registry/ToolDefinition.js';
import { analyzeImageTool, classifyIssueTool } from './visionTools.js';
import { resolveCoordinatesTool, getWardTool } from './locationTools.js';
import { searchNearbyIncidentsTool, compareDescriptionsTool } from './duplicateTools.js';
import { calculateSeverityRiskTool } from './severityTools.js';
import {
  getDepartmentTool,
  getDepartmentWorkloadTool,
  getAvailableTeamsTool,
  assignDepartmentTool,
  assignTeamTool,
} from './routingTools.js';
import { getIncidentHistoryTool } from './investigationTools.js';
import { createWorkOrderTool, updateWorkOrderTool } from './operationsTools.js';
import { verifyResolutionTool } from './verificationTools.js';
import { closeIncidentTool, reopenIncidentTool } from './incidentTools.js';
import { sendNotificationTool } from './notificationTools.js';
import {
  updateIncidentClassificationTool,
  updateIncidentLocationTool,
  linkReportToIncidentTool,
  setSeverityTool,
  validateIncidentTool,
} from './orchestrationTools.js';

export const ALL_TOOLS: ToolDefinition[] = [
  analyzeImageTool,
  classifyIssueTool,
  resolveCoordinatesTool,
  getWardTool,
  searchNearbyIncidentsTool,
  compareDescriptionsTool,
  calculateSeverityRiskTool,
  getDepartmentTool,
  getDepartmentWorkloadTool,
  getAvailableTeamsTool,
  assignDepartmentTool,
  assignTeamTool,
  getIncidentHistoryTool,
  createWorkOrderTool,
  updateWorkOrderTool,
  verifyResolutionTool,
  closeIncidentTool,
  reopenIncidentTool,
  sendNotificationTool,
  updateIncidentClassificationTool,
  updateIncidentLocationTool,
  linkReportToIncidentTool,
  setSeverityTool,
  validateIncidentTool,
];
