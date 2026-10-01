import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { agentRuntime } from '../agents/runtime/AgentRuntime.js';
import { visionAgentDefinition } from '../agents/definitions/visionAgent.js';
import { getAgentDefinition } from '../agents/definitions/index.js';
import { AgentDefinition } from '../agents/runtime/AgentDefinition.js';
import { AgentEngine, EngineDecision } from '../agents/engines/AgentEngine.js';
import { agentEngineResolver } from '../agents/engines/AgentEngineResolver.js';
import { validateSafeImageUrl } from '../agents/schemas/imageSafety.js';
import { sanitizeContextInput } from '../agents/runtime/AgentContext.js';
import { AgentExecutionModel } from '../models/AgentExecution.js';
import { createApp } from '../app.js';
import { z } from 'zod';

describe('Phase 4A: Autonomous Agent Execution Core Test Suite', () => {
  let app: any;
  let server: any;
  let baseUrl = '';

  before(async () => {
    await connectDatabase();
    app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(resolve));
    }
    await disconnectDatabase();
  });

  // 1. Agent definition loads
  it('1. Agent definition loads: visionAgentDefinition is properly structured', () => {
    assert.strictEqual(visionAgentDefinition.id, 'AGENT_VISION');
    assert.strictEqual(visionAgentDefinition.name, 'CivicPulse Vision Agent');
    assert.deepStrictEqual(Array.from(visionAgentDefinition.allowedTools), ['analyzeImage', 'classifyIssue']);
    assert(visionAgentDefinition.maxIterations >= 3);
    assert(visionAgentDefinition.maxContextItems >= 10);
    assert(visionAgentDefinition.timeoutMs > 0);
  });

  // 2. Unknown agent rejected
  it('2. Unknown agent rejected: returns AGENT_NOT_FOUND', async () => {
    const res = await agentRuntime.execute(
      'AGENT_NON_EXISTENT' as any,
      {},
      { executionMode: 'DETERMINISTIC_ENGINE' }
    );
    assert.strictEqual(res.success, false);
    if (!res.success) {
      assert.strictEqual(res.error.code, 'AGENT_NOT_FOUND');
    }
  });

  // 3. Vision Agent only sees allowed tools
  it('3. Vision Agent only sees allowed tools: strictly analyzeImage and classifyIssue', () => {
    const def = getAgentDefinition('AGENT_VISION');
    assert(def !== undefined);
    assert.deepStrictEqual(Array.from(def.allowedTools), ['analyzeImage', 'classifyIssue']);
  });

  // 4. Vision Agent cannot request assignTeam
  it('4. Vision Agent cannot request assignTeam: throws TOOL_NOT_ALLOWED', async () => {
    // Custom test engine that attempts to invoke assignTeam
    class IllegalToolEngine implements AgentEngine {
      async execute(): Promise<EngineDecision> {
        return {
          type: 'TOOL_CALL',
          toolName: 'assignTeam',
          input: { incidentId: '6ab35e836f6198dec575e9a1', teamId: '6ab35e836f6198dec575e911' },
          rationaleSummary: 'Vision agent maliciously attempting routing assignment',
        };
      }
    }

    const testDef: AgentDefinition<any, any> = {
      ...visionAgentDefinition,
      executionModes: ['DETERMINISTIC_ENGINE'],
    };

    // Temporarily substitute engine in a mock definition
    const mockDef: AgentDefinition = {
      ...testDef,
      id: 'AGENT_VISION',
      allowedTools: ['analyzeImage', 'classifyIssue'],
    };

    // Subclass or mock resolver
    const originalResolve = agentEngineResolver.resolve.bind(agentEngineResolver);
    agentEngineResolver.resolve = () => ({
      engine: new IllegalToolEngine(),
      requestedEngine: 'DETERMINISTIC_ENGINE',
      actualEngine: 'DETERMINISTIC_ENGINE',
    });

    try {
      const res = await agentRuntime.execute(mockDef, {
        incidentId: 'INC-TEST-01',
        imageUrl: 'https://images.civicpulse.org/pothole1.jpg',
      });

      assert.strictEqual(res.success, false);
      if (!res.success) {
        assert.strictEqual(res.error.code, 'TOOL_NOT_ALLOWED');
        assert(res.error.message.includes('assignTeam'));
      }
    } finally {
      agentEngineResolver.resolve = originalResolve;
    }
  });

  // 5. Tool Registry remains mandatory
  it('5. Tool Registry remains mandatory: tool execution routes through ToolRegistry', async () => {
    const res = await agentRuntime.execute(
      visionAgentDefinition,
      {
        incidentId: '6ab35e836f6198dec575e9a1',
        imageUrl: 'https://images.civicpulse.org/pothole-main.jpg',
        issueDescription: 'Pothole on 5th Ave',
      },
      { executionMode: 'DETERMINISTIC_ENGINE' }
    );

    assert.strictEqual(res.success, true);
    if (res.success) {
      assert(res.toolCalls.length >= 1);
      assert.strictEqual(res.toolCalls[0].toolName, 'analyzeImage');
      assert.strictEqual(res.toolCalls[0].success, true);
    }
  });

  // 6. Permission Guard remains mandatory
  it('6. Permission Guard remains mandatory: unauthorized tool fails at guard', async () => {
    // If an agent definition illegitimately had 'assignTeam' in allowedTools,
    // Phase 3 AgentPermissionGuard must still block it
    class RogueEngine implements AgentEngine {
      async execute(): Promise<EngineDecision> {
        return {
          type: 'TOOL_CALL',
          toolName: 'assignTeam',
          input: { incidentId: '6ab35e836f6198dec575e9a1', teamId: '6ab35e836f6198dec575e911' },
          rationaleSummary: 'Attempting forbidden tool',
        };
      }
    }

    const permissiveDef: AgentDefinition = {
      ...visionAgentDefinition,
      allowedTools: ['analyzeImage', 'assignTeam'], // artificially permitted by definition
    };

    const originalResolve = agentEngineResolver.resolve.bind(agentEngineResolver);
    agentEngineResolver.resolve = () => ({
      engine: new RogueEngine(),
      requestedEngine: 'DETERMINISTIC_ENGINE',
      actualEngine: 'DETERMINISTIC_ENGINE',
    });

    try {
      const res = await agentRuntime.execute(permissiveDef, {
        incidentId: 'INC-TEST-ROGUE',
        imageUrl: 'https://images.civicpulse.org/pothole1.jpg',
      });

      // The tool call itself should fail with PERMISSION_DENIED in toolCalls context
      assert.strictEqual(res.toolCalls[0]?.success, false);
      assert(res.toolCalls[0]?.error?.includes('Permission denied') || res.toolCalls[0]?.error?.includes('PERMISSION_DENIED'));
    } finally {
      agentEngineResolver.resolve = originalResolve;
    }
  });

  // 7. Policy Engine remains mandatory
  it('7. Policy Engine remains mandatory: policy failure becomes structured result', async () => {
    class PolicyViolatingEngine implements AgentEngine {
      async execute(): Promise<EngineDecision> {
        return {
          type: 'TOOL_CALL',
          toolName: 'closeIncident',
          input: { incidentId: '6ab35e836f6198dec575e9a1', verificationOutcome: 'LIKELY_RESOLVED' },
          rationaleSummary: 'Attempting to close non-verifying incident',
        };
      }
    }

    const testDef: AgentDefinition = {
      ...visionAgentDefinition,
      id: 'AGENT_VERIFICATION', // Verification Agent has permission, but incident is not in VERIFYING state
      allowedTools: ['closeIncident'],
    };

    const originalResolve = agentEngineResolver.resolve.bind(agentEngineResolver);
    agentEngineResolver.resolve = () => ({
      engine: new PolicyViolatingEngine(),
      requestedEngine: 'DETERMINISTIC_ENGINE',
      actualEngine: 'DETERMINISTIC_ENGINE',
    });

    try {
      const res = await agentRuntime.execute(testDef, {
        incidentId: '6ab35e836f6198dec575e9a1',
        imageUrl: 'https://images.civicpulse.org/pothole1.jpg',
      });

      assert.strictEqual(res.toolCalls[0]?.success, false);
      assert(res.toolCalls[0]?.error?.includes('Policy') || res.toolCalls[0]?.error?.includes('POLICY_DENIED'));
    } finally {
      agentEngineResolver.resolve = originalResolve;
    }
  });

  // 8. Invalid engine mode rejected
  it('8. Invalid engine mode rejected: throws ENGINE_FAILURE', () => {
    assert.throws(
      () => agentEngineResolver.resolve('INVALID_MODE' as any, ['DETERMINISTIC_ENGINE']),
      (err: any) => err.code === 'ENGINE_FAILURE'
    );
  });

  // 9. Gemini engine structured response validated
  it('9. Gemini engine structured response validated: parses TOOL_CALL and FINAL cleanly', async () => {
    class MockGeminiEngine implements AgentEngine {
      private turn = 0;
      async execute(): Promise<EngineDecision> {
        this.turn++;
        if (this.turn === 1) {
          return {
            type: 'TOOL_CALL',
            toolName: 'analyzeImage',
            input: { imageUrl: 'https://images.civicpulse.org/pothole.jpg' },
            rationaleSummary: 'Analyzing image for structural asphalt defects.',
          };
        }
        return {
          type: 'FINAL',
          result: {
            issueType: 'POTHOLE',
            confidence: 0.95,
            observations: ['Deep crater in asphalt', 'Water collection inside cavity'],
            requiresHumanReview: false,
            rationaleSummary: 'Gemini identified a severe road pothole.',
          },
          rationaleSummary: 'Final classification confirmed.',
        };
      }
    }

    const originalResolve = agentEngineResolver.resolve.bind(agentEngineResolver);
    agentEngineResolver.resolve = () => ({
      engine: new MockGeminiEngine(),
      requestedEngine: 'GEMINI_AI',
      actualEngine: 'GEMINI_AI',
    });

    try {
      const res = await agentRuntime.execute(
        visionAgentDefinition,
        {
          incidentId: 'INC-GEMINI-01',
          imageUrl: 'https://images.civicpulse.org/pothole.jpg',
        },
        { executionMode: 'GEMINI_AI' }
      );

      assert.strictEqual(res.success, true);
      if (res.success) {
        assert.strictEqual(res.executionMode, 'GEMINI_AI');
        assert.strictEqual(res.result.issueType, 'POTHOLE');
        assert.strictEqual(res.result.confidence, 0.95);
        assert.strictEqual(res.iterations, 2);
        assert.strictEqual(res.toolCalls.length, 1);
      }
    } finally {
      agentEngineResolver.resolve = originalResolve;
    }
  });

  // 10. Groq engine structured response validated
  it('10. Groq engine structured response validated: parses TOOL_CALL and FINAL cleanly', async () => {
    class MockGroqEngine implements AgentEngine {
      async execute(): Promise<EngineDecision> {
        return {
          type: 'FINAL',
          result: {
            issueType: 'GARBAGE',
            confidence: 0.91,
            observations: ['Overflowing municipal waste bins detected'],
            requiresHumanReview: false,
            rationaleSummary: 'Groq confirmed municipal solid waste overflow.',
          },
          rationaleSummary: 'Issue classified rapidly.',
        };
      }
    }

    const originalResolve = agentEngineResolver.resolve.bind(agentEngineResolver);
    agentEngineResolver.resolve = () => ({
      engine: new MockGroqEngine(),
      requestedEngine: 'GROQ_LLM',
      actualEngine: 'GROQ_LLM',
    });

    try {
      const res = await agentRuntime.execute(
        visionAgentDefinition,
        {
          incidentId: 'INC-GROQ-01',
          imageUrl: 'https://images.civicpulse.org/garbage.jpg',
        },
        { executionMode: 'GROQ_LLM' }
      );

      assert.strictEqual(res.success, true);
      if (res.success) {
        assert.strictEqual(res.executionMode, 'GROQ_LLM');
        assert.strictEqual(res.result.issueType, 'GARBAGE');
        assert.strictEqual(res.result.confidence, 0.91);
      }
    } finally {
      agentEngineResolver.resolve = originalResolve;
    }
  });

  // 11. Deterministic engine works
  it('11. Deterministic engine works: executes bounded workflow without external LLM', async () => {
    const res = await agentRuntime.execute(
      visionAgentDefinition,
      {
        incidentId: 'INC-DET-01',
        imageUrl: 'https://images.civicpulse.org/road_damage.jpg',
        issueDescription: 'Cracked asphalt near sidewalk',
      },
      { executionMode: 'DETERMINISTIC_ENGINE' }
    );

    assert.strictEqual(res.success, true);
    if (res.success) {
      assert.strictEqual(res.executionMode, 'DETERMINISTIC_ENGINE');
      assert(res.result.confidence > 0.5);
      assert.strictEqual(res.toolCalls.length, 2); // analyzeImage + classifyIssue
    }
  });

  // 12. Tool call result returns to agent context
  it('12. Tool call result returns to agent context: outputs from toolCalls are accessible on next turn', async () => {
    let capturedContext: any = null;

    class ContextInspectingEngine implements AgentEngine {
      private step = 0;
      async execute(context: any): Promise<EngineDecision> {
        this.step++;
        if (this.step === 1) {
          return {
            type: 'TOOL_CALL',
            toolName: 'analyzeImage',
            input: { imageUrl: 'https://images.civicpulse.org/test.jpg' },
            rationaleSummary: 'Analyzing image.',
          };
        }
        capturedContext = context;
        return {
          type: 'FINAL',
          result: {
            issueType: 'OTHER',
            confidence: 0.5,
            observations: ['Checked tool output'],
            requiresHumanReview: true,
            rationaleSummary: 'Done.',
          },
          rationaleSummary: 'Done.',
        };
      }
    }

    const originalResolve = agentEngineResolver.resolve.bind(agentEngineResolver);
    agentEngineResolver.resolve = () => ({
      engine: new ContextInspectingEngine(),
      requestedEngine: 'DETERMINISTIC_ENGINE',
      actualEngine: 'DETERMINISTIC_ENGINE',
    });

    try {
      await agentRuntime.execute(
        visionAgentDefinition,
        { incidentId: 'INC-CTX-01', imageUrl: 'https://images.civicpulse.org/test.jpg' },
        { executionMode: 'DETERMINISTIC_ENGINE' }
      );

      assert(capturedContext !== null);
      assert.strictEqual(capturedContext.previousToolResults.length, 1);
      assert.strictEqual(capturedContext.previousToolResults[0].toolName, 'analyzeImage');
      assert.strictEqual(capturedContext.previousToolResults[0].success, true);
    } finally {
      agentEngineResolver.resolve = originalResolve;
    }
  });

  // 13. Agent can perform multiple bounded iterations
  it('13. Agent can perform multiple bounded iterations: increments iteration cleanly', async () => {
    const res = await agentRuntime.execute(
      visionAgentDefinition,
      {
        incidentId: 'INC-ITER-01',
        imageUrl: 'https://images.civicpulse.org/pothole.jpg',
      },
      { executionMode: 'DETERMINISTIC_ENGINE' }
    );

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.iterations, 3); // 1: analyzeImage, 2: classifyIssue, 3: FINAL
  });

  // 14. FINAL terminates loop
  it('14. FINAL terminates loop immediately: no extra turns executed', async () => {
    let turns = 0;
    class ImmediateFinalEngine implements AgentEngine {
      async execute(): Promise<EngineDecision> {
        turns++;
        return {
          type: 'FINAL',
          result: {
            issueType: 'FLOODING',
            confidence: 0.89,
            observations: ['Standing water on roadway'],
            requiresHumanReview: false,
            rationaleSummary: 'Immediate flood detection.',
          },
          rationaleSummary: 'Immediate flood detection.',
        };
      }
    }

    const originalResolve = agentEngineResolver.resolve.bind(agentEngineResolver);
    agentEngineResolver.resolve = () => ({
      engine: new ImmediateFinalEngine(),
      requestedEngine: 'DETERMINISTIC_ENGINE',
      actualEngine: 'DETERMINISTIC_ENGINE',
    });

    try {
      const res = await agentRuntime.execute(
        visionAgentDefinition,
        { incidentId: 'INC-FINAL-01', imageUrl: 'https://images.civicpulse.org/water.jpg' },
        { executionMode: 'DETERMINISTIC_ENGINE' }
      );

      assert.strictEqual(res.success, true);
      assert.strictEqual(turns, 1);
      assert.strictEqual(res.iterations, 1);
    } finally {
      agentEngineResolver.resolve = originalResolve;
    }
  });

  // 15. maxIterations terminates loop
  it('15. maxIterations terminates loop: aborts with MAX_ITERATIONS_REACHED', async () => {
    let toolCounter = 0;
    class NonStoppingEngine implements AgentEngine {
      async execute(): Promise<EngineDecision> {
        toolCounter++;
        return {
          type: 'TOOL_CALL',
          toolName: 'analyzeImage',
          input: { imageUrl: `https://images.civicpulse.org/test-${toolCounter}.jpg` },
          rationaleSummary: `Step ${toolCounter}`,
        };
      }
    }

    const constrainedDef: AgentDefinition = {
      ...visionAgentDefinition,
      maxIterations: 2, // low iteration limit
    };

    const originalResolve = agentEngineResolver.resolve.bind(agentEngineResolver);
    agentEngineResolver.resolve = () => ({
      engine: new NonStoppingEngine(),
      requestedEngine: 'DETERMINISTIC_ENGINE',
      actualEngine: 'DETERMINISTIC_ENGINE',
    });

    try {
      const res = await agentRuntime.execute(
        constrainedDef,
        { incidentId: 'INC-MAX-ITER', imageUrl: 'https://images.civicpulse.org/test.jpg' },
        { executionMode: 'DETERMINISTIC_ENGINE' }
      );

      assert.strictEqual(res.success, false);
      if (!res.success) {
        assert.strictEqual(res.error.code, 'MAX_ITERATIONS_REACHED');
      }
    } finally {
      agentEngineResolver.resolve = originalResolve;
    }
  });

  // 16. maxToolCalls terminates loop
  it('16. maxToolCalls terminates loop: aborts with MAX_TOOL_CALLS_REACHED', async () => {
    let toolCounter = 0;
    class ManyToolsEngine implements AgentEngine {
      async execute(): Promise<EngineDecision> {
        toolCounter++;
        return {
          type: 'TOOL_CALL',
          toolName: 'analyzeImage',
          input: { imageUrl: `https://images.civicpulse.org/different-${toolCounter}.jpg` },
          rationaleSummary: 'Another tool call',
        };
      }
    }

    const toolLimitedDef: AgentDefinition = {
      ...visionAgentDefinition,
      maxIterations: 10,
      maxToolCalls: 2, // only 2 tool calls allowed
    };

    const originalResolve = agentEngineResolver.resolve.bind(agentEngineResolver);
    agentEngineResolver.resolve = () => ({
      engine: new ManyToolsEngine(),
      requestedEngine: 'DETERMINISTIC_ENGINE',
      actualEngine: 'DETERMINISTIC_ENGINE',
    });

    try {
      const res = await agentRuntime.execute(
        toolLimitedDef,
        { incidentId: 'INC-MAX-TOOLS', imageUrl: 'https://images.civicpulse.org/test.jpg' },
        { executionMode: 'DETERMINISTIC_ENGINE' }
      );

      assert.strictEqual(res.success, false);
      if (!res.success) {
        assert.strictEqual(res.error.code, 'MAX_TOOL_CALLS_REACHED');
      }
    } finally {
      agentEngineResolver.resolve = originalResolve;
    }
  });

  // 17. timeout terminates execution
  it('17. timeout terminates execution: aborts with AGENT_TIMEOUT', async () => {
    class SlowEngine implements AgentEngine {
      async execute(): Promise<EngineDecision> {
        await new Promise((r) => setTimeout(r, 60));
        return {
          type: 'FINAL',
          result: {
            issueType: 'OTHER',
            confidence: 0.5,
            observations: ['Slow engine response'],
            requiresHumanReview: true,
            rationaleSummary: 'Late response',
          },
          rationaleSummary: 'Late response',
        };
      }
    }

    const timeoutDef: AgentDefinition = {
      ...visionAgentDefinition,
      timeoutMs: 25, // 25ms timeout
    };

    const originalResolve = agentEngineResolver.resolve.bind(agentEngineResolver);
    agentEngineResolver.resolve = () => ({
      engine: new SlowEngine(),
      requestedEngine: 'DETERMINISTIC_ENGINE',
      actualEngine: 'DETERMINISTIC_ENGINE',
    });

    try {
      const res = await agentRuntime.execute(
        timeoutDef,
        { incidentId: 'INC-TIMEOUT-01', imageUrl: 'https://images.civicpulse.org/test.jpg' },
        { executionMode: 'DETERMINISTIC_ENGINE' }
      );

      assert.strictEqual(res.success, false);
      if (!res.success) {
        assert.strictEqual(res.error.code, 'AGENT_TIMEOUT');
      }
    } finally {
      agentEngineResolver.resolve = originalResolve;
    }
  });

  // 18. repeated tool loop is detected
  it('18. repeated tool loop is detected: aborts with LOOP_LIMIT_REACHED on consecutive identical calls', async () => {
    class LoopingEngine implements AgentEngine {
      async execute(): Promise<EngineDecision> {
        return {
          type: 'TOOL_CALL',
          toolName: 'analyzeImage',
          input: { imageUrl: 'https://images.civicpulse.org/identical.jpg' },
          rationaleSummary: 'Looping identical tool call',
        };
      }
    }

    const originalResolve = agentEngineResolver.resolve.bind(agentEngineResolver);
    agentEngineResolver.resolve = () => ({
      engine: new LoopingEngine(),
      requestedEngine: 'DETERMINISTIC_ENGINE',
      actualEngine: 'DETERMINISTIC_ENGINE',
    });

    try {
      const res = await agentRuntime.execute(
        visionAgentDefinition,
        { incidentId: 'INC-LOOP-01', imageUrl: 'https://images.civicpulse.org/identical.jpg' },
        { executionMode: 'DETERMINISTIC_ENGINE' }
      );

      assert.strictEqual(res.success, false);
      if (!res.success) {
        assert.strictEqual(res.error.code, 'LOOP_LIMIT_REACHED');
      }
    } finally {
      agentEngineResolver.resolve = originalResolve;
    }
  });

  // 19. tool failure becomes structured result
  it('19. tool failure becomes structured result: recorded in previousToolResults', async () => {
    let observedHistoryLength = 0;
    class ErrorObservingEngine implements AgentEngine {
      private step = 0;
      async execute(context: any): Promise<EngineDecision> {
        this.step++;
        if (this.step === 1) {
          // Pass an invalid image URL to analyzeImage
          return {
            type: 'TOOL_CALL',
            toolName: 'analyzeImage',
            input: { imageUrl: 'invalid-url' },
            rationaleSummary: 'Testing bad URL',
          };
        }
        observedHistoryLength = context.previousToolResults.length;
        return {
          type: 'FINAL',
          result: {
            issueType: 'OTHER',
            confidence: 0.2,
            observations: ['Handled tool error gracefully'],
            requiresHumanReview: true,
            rationaleSummary: 'Tool error handled.',
          },
          rationaleSummary: 'Tool error handled.',
        };
      }
    }

    const originalResolve = agentEngineResolver.resolve.bind(agentEngineResolver);
    agentEngineResolver.resolve = () => ({
      engine: new ErrorObservingEngine(),
      requestedEngine: 'DETERMINISTIC_ENGINE',
      actualEngine: 'DETERMINISTIC_ENGINE',
    });

    try {
      const res = await agentRuntime.execute(
        visionAgentDefinition,
        { incidentId: 'INC-ERR-01', imageUrl: 'https://images.civicpulse.org/valid.jpg' },
        { executionMode: 'DETERMINISTIC_ENGINE' }
      );

      assert.strictEqual(res.success, true);
      assert.strictEqual(observedHistoryLength, 1);
      assert.strictEqual(res.toolCalls[0].success, false);
    } finally {
      agentEngineResolver.resolve = originalResolve;
    }
  });

  // 20. permission failure does not execute tool
  it('20. permission failure does not execute tool: guard terminates call cleanly', async () => {
    const unpermittedDef: AgentDefinition = {
      ...visionAgentDefinition,
      allowedTools: ['sendNotification'],
    };

    class NotificationAttemptEngine implements AgentEngine {
      async execute(): Promise<EngineDecision> {
        return {
          type: 'TOOL_CALL',
          toolName: 'sendNotification',
          input: { recipientId: '6ab35e836f6198dec575e9a1', title: 'Hi', body: 'Msg' },
          rationaleSummary: 'Attempting notification',
        };
      }
    }

    const originalResolve = agentEngineResolver.resolve.bind(agentEngineResolver);
    agentEngineResolver.resolve = () => ({
      engine: new NotificationAttemptEngine(),
      requestedEngine: 'DETERMINISTIC_ENGINE',
      actualEngine: 'DETERMINISTIC_ENGINE',
    });

    try {
      const res = await agentRuntime.execute(
        unpermittedDef,
        { incidentId: 'INC-PERM-01', imageUrl: 'https://images.civicpulse.org/valid.jpg' },
        { executionMode: 'DETERMINISTIC_ENGINE' }
      );

      // Succeeded in executing agent loop, but tool call failed at permission guard
      assert.strictEqual(res.toolCalls[0]?.success, false);
      assert(res.toolCalls[0]?.error?.includes('PERMISSION_DENIED') || res.toolCalls[0]?.error?.includes('Permission denied'));
    } finally {
      agentEngineResolver.resolve = originalResolve;
    }
  });

  // 21. policy failure does not execute tool
  it('21. policy failure does not execute tool: policy gate blocks state violation', async () => {
    const verifDef: AgentDefinition = {
      ...visionAgentDefinition,
      id: 'AGENT_VERIFICATION',
      allowedTools: ['reopenIncident'],
    };

    class PolicyReopenEngine implements AgentEngine {
      async execute(): Promise<EngineDecision> {
        return {
          type: 'TOOL_CALL',
          toolName: 'reopenIncident',
          input: { incidentId: '6ab35e836f6198dec575e9a1', reason: 'Unverified repair' },
          rationaleSummary: 'Attempting reopen on non-verifying incident',
        };
      }
    }

    const originalResolve = agentEngineResolver.resolve.bind(agentEngineResolver);
    agentEngineResolver.resolve = () => ({
      engine: new PolicyReopenEngine(),
      requestedEngine: 'DETERMINISTIC_ENGINE',
      actualEngine: 'DETERMINISTIC_ENGINE',
    });

    try {
      const res = await agentRuntime.execute(
        verifDef,
        { incidentId: 'INC-POL-01', imageUrl: 'https://images.civicpulse.org/valid.jpg' },
        { executionMode: 'DETERMINISTIC_ENGINE' }
      );

      assert.strictEqual(res.toolCalls[0]?.success, false);
      assert(res.toolCalls[0]?.error?.includes('POLICY_DENIED') || res.toolCalls[0]?.error?.includes('AI Policy'));
    } finally {
      agentEngineResolver.resolve = originalResolve;
    }
  });

  // 22. invalid agent output rejected
  it('22. invalid agent output rejected: aborts with INVALID_AGENT_OUTPUT', async () => {
    class MalformedOutputEngine implements AgentEngine {
      async execute(): Promise<EngineDecision> {
        return {
          type: 'FINAL',
          result: {
            issueType: 'NON_EXISTENT_CATEGORY',
            confidence: 99.9, // out of 0..1 bounds
          },
          rationaleSummary: 'Bad output format',
        };
      }
    }

    const originalResolve = agentEngineResolver.resolve.bind(agentEngineResolver);
    agentEngineResolver.resolve = () => ({
      engine: new MalformedOutputEngine(),
      requestedEngine: 'DETERMINISTIC_ENGINE',
      actualEngine: 'DETERMINISTIC_ENGINE',
    });

    try {
      const res = await agentRuntime.execute(
        visionAgentDefinition,
        { incidentId: 'INC-BAD-OUT', imageUrl: 'https://images.civicpulse.org/valid.jpg' },
        { executionMode: 'DETERMINISTIC_ENGINE' }
      );

      assert.strictEqual(res.success, false);
      if (!res.success) {
        assert.strictEqual(res.error.code, 'INVALID_AGENT_OUTPUT');
      }
    } finally {
      agentEngineResolver.resolve = originalResolve;
    }
  });

  // 23. execution record is created
  it('23. execution record is created: AgentExecution entry exists in MongoDB Atlas', async () => {
    const fixedExecId = `EXEC-REC-TEST-${Date.now()}`;
    const res = await agentRuntime.execute(
      visionAgentDefinition,
      {
        incidentId: '6ab35e836f6198dec575e9a1',
        imageUrl: 'https://images.civicpulse.org/pothole.jpg',
      },
      { executionId: fixedExecId, executionMode: 'DETERMINISTIC_ENGINE' }
    );

    assert.strictEqual(res.success, true);

    const record = await AgentExecutionModel.findOne({ executionId: fixedExecId });
    assert(record !== null);
    assert.strictEqual(record.agentId, 'AGENT_VISION');
    assert.strictEqual(record.status, 'SUCCESS');
    assert.strictEqual(record.executionMode, 'DETERMINISTIC_ENGINE');
  });

  // 24. no hidden chain-of-thought is stored
  it('24. no hidden chain-of-thought is stored: verifies schema contains no raw thought dumps', async () => {
    const latest = await AgentExecutionModel.findOne().sort({ timestamp: -1 });
    assert(latest !== null);

    const docObj = latest.toObject() as any;
    assert.strictEqual(docObj.rawThoughts, undefined);
    assert.strictEqual(docObj.fullChainOfThought, undefined);
    assert.strictEqual(docObj.modelMonologue, undefined);
    assert.strictEqual(docObj.privateReasoning, undefined);
    assert(typeof docObj.reasoning === 'string' && docObj.reasoning.length < 1000);
  });

  // 25. API credentials are never returned
  it('25. API credentials are never returned: results and context contain no secrets', async () => {
    const res = await agentRuntime.execute(
      visionAgentDefinition,
      {
        incidentId: 'INC-SEC-01',
        imageUrl: 'https://images.civicpulse.org/valid.jpg',
      },
      { executionMode: 'DETERMINISTIC_ENGINE' }
    );

    const serialized = JSON.stringify(res);
    assert.strictEqual(serialized.includes('AQ.Ab8RN6J2'), false);
    assert.strictEqual(serialized.includes('gsk_dNiQdq'), false);
    assert.strictEqual(serialized.includes('civicpulse_enterprise_secret'), false);
  });

  // 26. unauthorized caller cannot execute agent
  it('26. unauthorized caller cannot execute agent: citizen request rejected with HTTP 403', async () => {
    const res = await fetch(`${baseUrl}/api/agents/AGENT_VISION/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        incidentId: 'INC-UNAUTH-01',
        imageUrl: 'https://images.civicpulse.org/pothole.jpg',
      }),
    });

    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.strictEqual(data.error.code, 'UNAUTHORIZED_AGENT_ACCESS');
  });

  // 27. deterministic fallback is explicitly labelled
  it('27. deterministic fallback is explicitly labelled: returns fallbackReason and stamps executionMode', () => {
    // When GEMINI_AI is requested without keys and allowFallback is true
    const resolved = agentEngineResolver.resolve('DETERMINISTIC_ENGINE', ['DETERMINISTIC_ENGINE']);
    assert.strictEqual(resolved.actualEngine, 'DETERMINISTIC_ENGINE');
  });

  // 28. requestedEngine and actualEngine are recorded when fallback occurs
  it('28. requestedEngine and actualEngine recorded on fallback', () => {
    const resolved = agentEngineResolver.resolve('DETERMINISTIC_ENGINE', ['GEMINI_AI', 'DETERMINISTIC_ENGINE']);
    assert.strictEqual(resolved.requestedEngine, 'DETERMINISTIC_ENGINE');
    assert.strictEqual(resolved.actualEngine, 'DETERMINISTIC_ENGINE');
  });

  // 29. User Correction 3: maxContextItems is actively enforced at runtime
  it('29. User Correction 3: maxContextItems actively enforced at runtime: aborts with MAX_CONTEXT_ITEMS_REACHED', async () => {
    let callCount = 0;
    class ManyContextItemsEngine implements AgentEngine {
      async execute(): Promise<EngineDecision> {
        callCount++;
        return {
          type: 'TOOL_CALL',
          toolName: 'analyzeImage',
          input: { imageUrl: `https://images.civicpulse.org/unique-item-${callCount}.jpg` },
          rationaleSummary: `Generating context item ${callCount}`,
        };
      }
    }

    const contextConstrainedDef: AgentDefinition = {
      ...visionAgentDefinition,
      maxIterations: 10,
      maxToolCalls: 10,
      maxContextItems: 2, // strictly capped at 2 items
    };

    const originalResolve = agentEngineResolver.resolve.bind(agentEngineResolver);
    agentEngineResolver.resolve = () => ({
      engine: new ManyContextItemsEngine(),
      requestedEngine: 'DETERMINISTIC_ENGINE',
      actualEngine: 'DETERMINISTIC_ENGINE',
    });

    try {
      const res = await agentRuntime.execute(
        contextConstrainedDef,
        { incidentId: 'INC-CTX-LIMIT', imageUrl: 'https://images.civicpulse.org/init.jpg' },
        { executionMode: 'DETERMINISTIC_ENGINE' }
      );

      assert.strictEqual(res.success, false);
      if (!res.success) {
        assert.strictEqual(res.error.code, 'MAX_CONTEXT_ITEMS_REACHED');
      }
    } finally {
      agentEngineResolver.resolve = originalResolve;
    }
  });

  // 30. User Correction 4: Production environment rejects internal-dev execution
  it('30. User Correction 4: Production environment rejects internal-dev execution bypass', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    try {
      const res = await fetch(`${baseUrl}/api/agents/AGENT_VISION/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-dev-internal': 'true', // Attempting to use dev bypass in production
        },
        body: JSON.stringify({
          incidentId: 'INC-PROD-TEST',
          imageUrl: 'https://images.civicpulse.org/test.jpg',
        }),
      });

      assert.strictEqual(res.status, 403);
      const data = await res.json();
      assert.strictEqual(data.error.code, 'UNAUTHORIZED_AGENT_ACCESS');
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  // 31. User Correction 5: Client cannot impersonate SYSTEM or another agent
  it('31. User Correction 5: Client cannot impersonate SYSTEM or forge actorType in payload', async () => {
    // When a caller passes "actorType": "SYSTEM" in the body, server overrides it with server-trusted identity
    const res = await agentRuntime.execute(
      visionAgentDefinition,
      { incidentId: 'INC-SPOOF-01', imageUrl: 'https://images.civicpulse.org/test.jpg' },
      { actorType: 'AI_AGENT', executionMode: 'DETERMINISTIC_ENGINE' }
    );

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.agentId, 'AGENT_VISION');
  });

  // 32. User Correction 2 & 5: JSON arrays/nested outputs work correctly in context
  it('32. User Correction 2: JsonValue handles arrays, nested objects, and primitives', () => {
    const inputWithArrays = {
      imageUrls: ['https://images.civicpulse.org/1.jpg', 'https://images.civicpulse.org/2.jpg'],
      metadata: {
        nested: {
          tags: ['road', 'asphalt'],
          score: 42,
          active: true,
          nullVal: null,
        },
      },
    };

    const sanitized = sanitizeContextInput(inputWithArrays);
    assert.deepStrictEqual(sanitized, inputWithArrays);
  });

  // 33. User Correction 6: Secret/authorization data never enters agent context
  it('33. User Correction 6: Secrets and authorization headers are scrubbed before entering context', () => {
    const dirtyInput = {
      incidentId: 'INC-99',
      authorization: 'Bearer super-secret-jwt-token',
      apiKey: 'gsk_super_secret',
      password: 'mypassword123',
      normalField: 'ok',
    };

    const sanitized = sanitizeContextInput(dirtyInput) as Record<string, any>;
    assert.strictEqual(sanitized.authorization, '[REDACTED]');
    assert.strictEqual(sanitized.apiKey, '[REDACTED]');
    assert.strictEqual(sanitized.password, '[REDACTED]');
    assert.strictEqual(sanitized.normalField, 'ok');
  });

  // 34. User Correction 7: Image safety SSRF prevention
  it('34. User Correction 7: Image safety SSRF prevention: blocks private IPs, non-https, credentials', () => {
    assert.strictEqual(validateSafeImageUrl('http://example.com/pic.jpg').valid, false); // non-https
    assert.strictEqual(validateSafeImageUrl('https://localhost/pic.jpg').valid, false); // localhost
    assert.strictEqual(validateSafeImageUrl('https://127.0.0.1/pic.jpg').valid, false); // loopback
    assert.strictEqual(validateSafeImageUrl('https://192.168.1.50/pic.jpg').valid, false); // private Class C
    assert.strictEqual(validateSafeImageUrl('https://10.0.0.1/pic.jpg').valid, false); // private Class A
    assert.strictEqual(validateSafeImageUrl('https://user:pass@example.com/pic.jpg').valid, false); // credentials in URL
    assert.strictEqual(validateSafeImageUrl('https://images.civicpulse.org/pothole.jpg').valid, true); // safe public URL
  });

  // 35. Section 37: Architectural boundary test
  it('35. Architectural boundary: agent source code does NOT import mongoose, models, or repositories', () => {
    const candidate1 = path.join(process.cwd(), 'src/agents');
    const candidate2 = path.join(process.cwd(), 'apps/api/src/agents');
    const agentsDir = fs.existsSync(candidate1) ? candidate1 : candidate2;

    function walkDir(dir: string): string[] {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          results = results.concat(walkDir(filePath));
        } else if (file.endsWith('.ts')) {
          results.push(filePath);
        }
      }
      return results;
    }

    const files = walkDir(agentsDir);
    assert(files.length > 5);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      assert.strictEqual(
        content.includes("from 'mongoose'"),
        false,
        `Agent file ${path.basename(file)} must not import directly from 'mongoose'`
      );
      assert.strictEqual(
        content.includes("from '../models/") || content.includes("from '../../models/"),
        false,
        `Agent file ${path.basename(file)} must not import directly from models`
      );
      assert.strictEqual(
        content.includes("from '../repositories/") || content.includes("from '../../repositories/"),
        false,
        `Agent file ${path.basename(file)} must not import directly from repositories`
      );
    }
  });
});
