import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { agentRuntime } from '../agents/runtime/AgentRuntime.js';
import { visionAgentDefinition } from '../agents/definitions/visionAgent.js';
import { AgentExecutionModel } from '../models/AgentExecution.js';
import { AgentDefinition } from '../agents/runtime/AgentDefinition.js';
import { AgentEngine, EngineDecision } from '../agents/engines/AgentEngine.js';
import { agentEngineResolver } from '../agents/engines/AgentEngineResolver.js';
import { logger } from '../utils/logger.js';

async function runPhase4AManualVerification() {
  console.log('====================================================');
  console.log('CIVICPULSE PHASE 4A: MANUAL VERIFICATION SUITE');
  console.log('====================================================\n');

  await connectDatabase();

  try {
    // ----------------------------------------------------
    // Scenario 1: AGENT_VISION with DETERMINISTIC_ENGINE
    // ----------------------------------------------------
    console.log('--- Scenario 1: AGENT_VISION with DETERMINISTIC_ENGINE ---');
    const resDeterministic = await agentRuntime.execute(
      visionAgentDefinition,
      {
        incidentId: '6ab35e836f6198dec575e9a1',
        imageUrl: 'https://images.civicpulse.org/pothole-sample.jpg',
        issueDescription: 'Pothole on Main Street with visible depth',
      },
      { executionMode: 'DETERMINISTIC_ENGINE' }
    );
    console.log('Scenario 1 Success:', resDeterministic.success);
    console.log('Scenario 1 Iterations:', resDeterministic.iterations);
    console.log('Scenario 1 Tool Calls Count:', resDeterministic.toolCalls.length);
    if (resDeterministic.success) {
      console.log('Scenario 1 Result:', JSON.stringify(resDeterministic.result, null, 2));
    }

    // ----------------------------------------------------
    // Scenario 2: AGENT_VISION with Allowed Image Analysis Tool
    // ----------------------------------------------------
    console.log('\n--- Scenario 2: Allowed Tool Execution Through ToolRegistry ---');
    if (resDeterministic.toolCalls.length > 0) {
      const firstCall = resDeterministic.toolCalls[0];
      console.log(`Tool Invoked: ${firstCall.toolName}`);
      console.log(`Tool Success: ${firstCall.success}`);
      console.log(`Tool Output:`, JSON.stringify(firstCall.output, null, 2));
    }

    // ----------------------------------------------------
    // Scenario 3: Vision Agent Requesting Unauthorized Tool
    // ----------------------------------------------------
    console.log('\n--- Scenario 3: Agent Requesting Unauthorized Tool (assignTeam) ---');
    class UnauthorizedToolEngine implements AgentEngine {
      async execute(): Promise<EngineDecision> {
        return {
          type: 'TOOL_CALL',
          toolName: 'assignTeam',
          input: { incidentId: '6ab35e836f6198dec575e9a1', teamId: '6ab35e836f6198dec575e999' },
          rationaleSummary: 'Attempting to assign team directly.',
        };
      }
    }

    const originalResolve = agentEngineResolver.resolve.bind(agentEngineResolver);
    agentEngineResolver.resolve = () => ({
      engine: new UnauthorizedToolEngine(),
      requestedEngine: 'DETERMINISTIC_ENGINE',
      actualEngine: 'DETERMINISTIC_ENGINE',
    });

    try {
      const resUnauth = await agentRuntime.execute(
        visionAgentDefinition,
        {
          incidentId: '6ab35e836f6198dec575e9a1',
          imageUrl: 'https://images.civicpulse.org/pothole-sample.jpg',
        },
        { executionMode: 'DETERMINISTIC_ENGINE' }
      );
      console.log('Scenario 3 Success (Expected false):', resUnauth.success);
      if (!resUnauth.success) {
        console.log('Scenario 3 Error Code:', resUnauth.error.code);
        console.log('Scenario 3 Error Message:', resUnauth.error.message);
      }
    } finally {
      agentEngineResolver.resolve = originalResolve;
    }

    // ----------------------------------------------------
    // Scenario 4: Forcing Invalid Agent Output Schema
    // ----------------------------------------------------
    console.log('\n--- Scenario 4: Forcing Invalid Agent Output Schema ---');
    class InvalidOutputEngine implements AgentEngine {
      async execute(): Promise<EngineDecision> {
        return {
          type: 'FINAL',
          result: {
            invalidField: true, // Missing issueType, confidence, observations
          },
          rationaleSummary: 'Providing non-schema conforming output.',
        };
      }
    }

    agentEngineResolver.resolve = () => ({
      engine: new InvalidOutputEngine(),
      requestedEngine: 'DETERMINISTIC_ENGINE',
      actualEngine: 'DETERMINISTIC_ENGINE',
    });

    try {
      const resInvalid = await agentRuntime.execute(
        visionAgentDefinition,
        {
          incidentId: '6ab35e836f6198dec575e9a1',
          imageUrl: 'https://images.civicpulse.org/pothole-sample.jpg',
        },
        { executionMode: 'DETERMINISTIC_ENGINE' }
      );
      console.log('Scenario 4 Success (Expected false):', resInvalid.success);
      if (!resInvalid.success) {
        console.log('Scenario 4 Error Code:', resInvalid.error.code);
      }
    } finally {
      agentEngineResolver.resolve = originalResolve;
    }

    // ----------------------------------------------------
    // Scenario 5: Forcing Engine Timeout
    // ----------------------------------------------------
    console.log('\n--- Scenario 5: Forcing Engine Timeout ---');
    class SlowEngine implements AgentEngine {
      async execute(): Promise<EngineDecision> {
        await new Promise((resolve) => setTimeout(resolve, 80));
        return {
          type: 'FINAL',
          result: {
            issueType: 'OTHER',
            confidence: 0.1,
            observations: ['Too slow'],
            requiresHumanReview: true,
            rationaleSummary: 'Completed too late.',
          },
          rationaleSummary: 'Completed too late.',
        };
      }
    }

    const shortTimeoutDef: AgentDefinition = {
      ...visionAgentDefinition,
      timeoutMs: 30, // 30ms timeout
    };

    agentEngineResolver.resolve = () => ({
      engine: new SlowEngine(),
      requestedEngine: 'DETERMINISTIC_ENGINE',
      actualEngine: 'DETERMINISTIC_ENGINE',
    });

    try {
      const resTimeout = await agentRuntime.execute(
        shortTimeoutDef,
        {
          incidentId: '6ab35e836f6198dec575e9a1',
          imageUrl: 'https://images.civicpulse.org/pothole-sample.jpg',
        },
        { executionMode: 'DETERMINISTIC_ENGINE' }
      );
      console.log('Scenario 5 Success (Expected false):', resTimeout.success);
      if (!resTimeout.success) {
        console.log('Scenario 5 Error Code:', resTimeout.error.code);
        console.log('Scenario 5 Duration:', resTimeout.durationMs, 'ms');
      }
    } finally {
      agentEngineResolver.resolve = originalResolve;
    }

    // ----------------------------------------------------
    // Scenario 6: Forcing Repeated Tool Calls (Loop Limit)
    // ----------------------------------------------------
    console.log('\n--- Scenario 6: Forcing Repeated Consecutive Tool Calls ---');
    class LoopingEngine implements AgentEngine {
      async execute(): Promise<EngineDecision> {
        return {
          type: 'TOOL_CALL',
          toolName: 'analyzeImage',
          input: { imageUrl: 'https://images.civicpulse.org/identical-repeat.jpg' },
          rationaleSummary: 'Repeated call with identical parameters.',
        };
      }
    }

    agentEngineResolver.resolve = () => ({
      engine: new LoopingEngine(),
      requestedEngine: 'DETERMINISTIC_ENGINE',
      actualEngine: 'DETERMINISTIC_ENGINE',
    });

    try {
      const resLoop = await agentRuntime.execute(
        visionAgentDefinition,
        {
          incidentId: '6ab35e836f6198dec575e9a1',
          imageUrl: 'https://images.civicpulse.org/identical-repeat.jpg',
        },
        { executionMode: 'DETERMINISTIC_ENGINE' }
      );
      console.log('Scenario 6 Success (Expected false):', resLoop.success);
      if (!resLoop.success) {
        console.log('Scenario 6 Error Code:', resLoop.error.code);
        console.log('Scenario 6 Error Message:', resLoop.error.message);
      }
    } finally {
      agentEngineResolver.resolve = originalResolve;
    }

    // ----------------------------------------------------
    // Scenario 7: Forcing Engine Failure
    // ----------------------------------------------------
    console.log('\n--- Scenario 7: Forcing Engine Failure ---');
    class CrashingEngine implements AgentEngine {
      async execute(): Promise<EngineDecision> {
        throw new Error('Simulated external provider crash / connection reset.');
      }
    }

    agentEngineResolver.resolve = () => ({
      engine: new CrashingEngine(),
      requestedEngine: 'GEMINI_AI',
      actualEngine: 'GEMINI_AI',
    });

    try {
      const resCrash = await agentRuntime.execute(
        visionAgentDefinition,
        {
          incidentId: '6ab35e836f6198dec575e9a1',
          imageUrl: 'https://images.civicpulse.org/crash-test.jpg',
        },
        { executionMode: 'GEMINI_AI', allowFallback: false }
      );
      console.log('Scenario 7 Success (Expected false):', resCrash.success);
      if (!resCrash.success) {
        console.log('Scenario 7 Error Code:', resCrash.error.code);
        console.log('Scenario 7 Error Message:', resCrash.error.message);
      }
    } finally {
      agentEngineResolver.resolve = originalResolve;
    }

    // ----------------------------------------------------
    // Scenario 8: Inspect AgentExecution in MongoDB Atlas
    // ----------------------------------------------------
    console.log('\n--- Scenario 8: Inspect AgentExecution in MongoDB Atlas ---');
    const recentExecutions = await AgentExecutionModel.find({ agentId: 'AGENT_VISION' })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    console.log(`Found ${recentExecutions.length} recent AGENT_VISION execution records in MongoDB Atlas:`);
    for (const exec of recentExecutions) {
      console.log(`\n• Execution ID: ${exec.executionId}`);
      console.log(`  Agent: ${exec.agentId} (${exec.agentName})`);
      console.log(`  Mode: ${exec.executionMode} | Requested: ${exec.requestedEngine || 'N/A'} | Actual: ${exec.actualEngine || 'N/A'}`);
      console.log(`  Status: ${exec.status} | Duration: ${exec.durationMs}ms | Iterations: ${exec.iterations}`);
      console.log(`  Tools Called: ${exec.toolsCalled?.length || 0}`);
      console.log(`  Reasoning Summary: ${exec.reasoning?.slice(0, 100)}...`);
      
      // Verify NO hidden chain-of-thought
      const rawKeys = Object.keys(exec);
      const forbiddenThoughtKeys = ['rawThoughts', 'fullChainOfThought', 'modelMonologue', 'privateReasoning'];
      const hasForbidden = forbiddenThoughtKeys.some((k) => rawKeys.includes(k));
      console.log(`  No Hidden Chain-of-Thought verified: ${!hasForbidden}`);
    }

    console.log('\n====================================================');
    console.log('PHASE 4A MANUAL VERIFICATION COMPLETED SUCCESSFULLY');
    console.log('====================================================\n');
  } catch (err) {
    logger.error('Phase 4A manual verification encountered an error:', err);
    throw err;
  } finally {
    await disconnectDatabase();
  }
}

runPhase4AManualVerification().catch((err) => {
  console.error('Manual verification failed:', err);
  process.exit(1);
});
