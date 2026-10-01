import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { WorkOrderModel } from '../../models/WorkOrder.js';
import { IncidentModel } from '../../models/Incident.js';
import { EvidenceModel } from '../../models/Evidence.js';
import { incidentEventBus } from '../../services/incidentEventBus.js';
import { agentRuntime } from '../../agents/runtime/AgentRuntime.js';
import { VerificationAgentInput, VerificationAgentOutput } from '../../agents/schemas/verificationSchemas.js';
import { logger } from '../../utils/logger.js';

export class WorkOrderController {
  async getOfficerTasks(req: Request, res: Response): Promise<void> {
    try {
      const officerId = req.user?.id;
      const teamId = req.user?.teamId;
      const role = req.user?.role;

      const query: any = {};

      if (role === 'FIELD_OFFICER' && officerId) {
        // Find tasks assigned to this officer, their team, or unassigned active
        const conditions: any[] = [{ assignedOfficerId: new mongoose.Types.ObjectId(officerId) }];
        if (teamId && mongoose.Types.ObjectId.isValid(teamId)) {
          conditions.push({ teamId: new mongoose.Types.ObjectId(teamId) });
        }
        // If none specifically assigned, return all active for visibility
        query.$or = [
          ...conditions,
          { status: { $in: ['CREATED', 'ASSIGNED', 'IN_PROGRESS'] } },
        ];
      }

      const tasks = await WorkOrderModel.find(query)
        .populate('incidentId')
        .populate('departmentId')
        .populate('teamId')
        .populate('beforeEvidenceIds')
        .populate('afterEvidenceIds')
        .sort({ updatedAt: -1 })
        .limit(50);

      res.json({
        success: true,
        data: tasks,
      });
    } catch (err: any) {
      logger.error('Error fetching officer tasks:', err);
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async getWorkOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const query: any = mongoose.Types.ObjectId.isValid(id)
        ? { _id: id }
        : { workOrderNumber: id };

      const workOrder = await WorkOrderModel.findOne(query)
        .populate('incidentId')
        .populate('departmentId')
        .populate('teamId')
        .populate('assignedOfficerId', 'name email role phone')
        .populate('beforeEvidenceIds')
        .populate('afterEvidenceIds');

      if (!workOrder) {
        res.status(404).json({ success: false, error: { message: 'Work order not found' } });
        return;
      }

      res.json({ success: true, data: workOrder });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async acceptTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const query: any = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { workOrderNumber: id };

      const workOrder = await WorkOrderModel.findOne(query);
      if (!workOrder) {
        res.status(404).json({ success: false, error: { message: 'Work order not found' } });
        return;
      }

      workOrder.status = 'ASSIGNED';
      if (req.user?.id && mongoose.Types.ObjectId.isValid(req.user.id)) {
        workOrder.assignedOfficerId = new mongoose.Types.ObjectId(req.user.id);
      }
      await workOrder.save();

      res.json({ success: true, data: workOrder, message: 'Work order accepted by officer' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async startTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const query: any = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { workOrderNumber: id };

      const workOrder = await WorkOrderModel.findOne(query);
      if (!workOrder) {
        res.status(404).json({ success: false, error: { message: 'Work order not found' } });
        return;
      }

      workOrder.status = 'IN_PROGRESS';
      workOrder.startedAt = new Date();
      await workOrder.save();

      // Transition incident status to IN_PROGRESS
      const incident = await IncidentModel.findById(workOrder.incidentId);
      if (incident && incident.status === 'ASSIGNED') {
        incident.status = 'IN_PROGRESS';
        await incident.save();
        incidentEventBus.emitIncidentEvent('STATUS_CHANGED', incident, {
          workOrderId: workOrder._id.toString(),
          reason: 'Officer commenced on-site repair operations',
        });
      }

      res.json({ success: true, data: workOrder, message: 'Work started' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async attachEvidence(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { evidenceId, type = 'AFTER' } = req.body;

      const query: any = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { workOrderNumber: id };
      const workOrder = await WorkOrderModel.findOne(query);
      if (!workOrder) {
        res.status(404).json({ success: false, error: { message: 'Work order not found' } });
        return;
      }

      if (evidenceId && mongoose.Types.ObjectId.isValid(evidenceId)) {
        const evObjId = new mongoose.Types.ObjectId(evidenceId);
        if (type === 'AFTER') {
          workOrder.afterEvidenceIds.addToSet(evObjId);
        } else {
          workOrder.beforeEvidenceIds.addToSet(evObjId);
        }
        await workOrder.save();

        // Also link to incident
        await IncidentModel.findByIdAndUpdate(workOrder.incidentId, {
          $addToSet: { evidenceIds: evObjId },
          ...(type === 'AFTER' ? { afterEvidenceId: evObjId } : {}),
        });
      }

      res.json({ success: true, data: workOrder, message: 'Evidence linked to work order' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async completeTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { completionNotes, afterEvidenceId, checklist } = req.body;

      const query: any = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { workOrderNumber: id };
      const workOrder = await WorkOrderModel.findOne(query);
      if (!workOrder) {
        res.status(404).json({ success: false, error: { message: 'Work order not found' } });
        return;
      }

      workOrder.status = 'COMPLETED';
      workOrder.completedAt = new Date();
      if (completionNotes) workOrder.completionNotes = completionNotes;
      if (checklist && Array.isArray(checklist)) workOrder.checklist = checklist;
      if (afterEvidenceId && mongoose.Types.ObjectId.isValid(afterEvidenceId)) {
        workOrder.afterEvidenceIds.addToSet(new mongoose.Types.ObjectId(afterEvidenceId));
      }
      await workOrder.save();

      // Transition incident: RESOLVED -> VERIFYING
      const incident = await IncidentModel.findById(workOrder.incidentId);
      if (incident) {
        incident.status = 'RESOLVED';
        if (afterEvidenceId && mongoose.Types.ObjectId.isValid(afterEvidenceId)) {
          incident.afterEvidenceId = new mongoose.Types.ObjectId(afterEvidenceId);
        }
        await incident.save();

        incidentEventBus.emitIncidentEvent('STATUS_CHANGED', incident, {
          workOrderId: workOrder._id.toString(),
          reason: 'Field officer submitted repair completion',
        });

        // Next transition to VERIFYING for autonomous Verification Agent
        incident.status = 'VERIFYING';
        await incident.save();

        incidentEventBus.emitIncidentEvent('STATUS_CHANGED', incident, {
          workOrderId: workOrder._id.toString(),
          reason: 'Autonomous verification agent initiated',
        });

        // Trigger Verification Agent asynchronously
        setTimeout(async () => {
          try {
            await triggerVerificationAgent(incident._id.toString(), afterEvidenceId);
          } catch (agentErr) {
            logger.error('Autonomous verification execution failed:', agentErr);
          }
        }, 100);
      }

      res.json({
        success: true,
        data: workOrder,
        message: 'Work order marked complete. Autonomous Verification Agent triggered.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }
}

/**
 * Triggers the autonomous AGENT_VERIFICATION to visually compare before & after evidence.
 */
async function triggerVerificationAgent(incidentId: string, afterEvidenceId?: string): Promise<void> {
  const incident = await IncidentModel.findById(incidentId);
  if (!incident) return;

  // Retrieve before and after evidence documents
  const beforeEvidence = incident.beforeEvidenceId
    ? await EvidenceModel.findById(incident.beforeEvidenceId)
    : await EvidenceModel.findOne({ incidentId: incident._id, type: 'BEFORE' });

  const afterEvidence = afterEvidenceId
    ? await EvidenceModel.findById(afterEvidenceId)
    : incident.afterEvidenceId
    ? await EvidenceModel.findById(incident.afterEvidenceId)
    : await EvidenceModel.findOne({ incidentId: incident._id, type: 'AFTER' });

  const beforeUrl = beforeEvidence?.fileUrl || 'https://images.civicpulse.org/pothole-before.jpg';
  const afterUrl = afterEvidence?.fileUrl || 'https://images.civicpulse.org/pothole-after.jpg';

  const verificationInput: VerificationAgentInput = {
    incidentId,
    category: incident.category,
    beforeImageUrl: beforeUrl,
    afterImageUrl: afterUrl,
    threshold: 0.75,
  };

  const execRes = await agentRuntime.execute<VerificationAgentInput, VerificationAgentOutput>(
    'AGENT_VERIFICATION',
    verificationInput,
    {
      incidentId,
      actorType: 'AI_AGENT',
      actorId: 'AGENT_VERIFICATION',
      executionMode: 'GEMINI_AI',
      allowFallback: true,
    }
  );

  if (execRes.success && execRes.result) {
    const passed = execRes.result.decision === 'PASS';
    incident.status = passed ? 'CLOSED' : 'REOPENED';
    incident.verificationResult = {
      outcome: passed ? 'LIKELY_RESOLVED' : 'POSSIBLY_UNRESOLVED',
      confidence: execRes.result.confidence,
      explanation: execRes.result.reasoning || execRes.result.observations?.join('; ') || 'Verified by AGENT_VERIFICATION',
      beforeEvidenceId: beforeEvidence?._id?.toString() || '',
      afterEvidenceId: afterEvidence?._id?.toString() || '',
      verifiedAt: new Date().toISOString(),
      verifiedByAgent: 'AGENT_VERIFICATION',
    };

    if (!passed) {
      incident.reopenCount = (incident.reopenCount || 0) + 1;
    }

    await incident.save();

    incidentEventBus.emitIncidentEvent(
      passed ? 'VERIFICATION_COMPLETED' : 'INCIDENT_REOPENED',
      incident,
      {
        verificationConfidence: execRes.result.confidence,
        decision: execRes.result.decision,
        observations: execRes.result.observations,
      }
    );

    logger.info(`Autonomous verification for incident ${incidentId} completed: ${incident.status} (${execRes.result.confidence})`);
  }
}

export const workOrderController = new WorkOrderController();
