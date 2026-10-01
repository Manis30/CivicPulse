import { ExecutionMode } from '@civicpulse/shared';
import { AgentEngine } from './AgentEngine.js';
import { GeminiEngine } from './GeminiEngine.js';
import { GroqEngine } from './GroqEngine.js';
import { DeterministicEngine } from './DeterministicEngine.js';
import { AgentRuntimeError } from '../runtime/AgentRuntimeError.js';
import { env } from '../../config/env.js';

export interface ResolvedEngineInfo {
  engine: AgentEngine;
  requestedEngine: ExecutionMode;
  actualEngine: ExecutionMode;
  fallbackReason?: string;
}

export class AgentEngineResolver {
  private geminiEngine: GeminiEngine | null = null;
  private groqEngine: GroqEngine | null = null;
  private deterministicEngine: DeterministicEngine | null = null;

  constructor() {
    this.deterministicEngine = new DeterministicEngine();
  }

  /**
   * Resolves the requested execution engine.
   * If allowFallback is true and the requested LLM key is absent,
   * falls back to DETERMINISTIC_ENGINE with full explicit reporting.
   */
  resolve(
    requestedMode: ExecutionMode,
    supportedModes: readonly ExecutionMode[],
    allowFallback = false
  ): ResolvedEngineInfo {
    if (!supportedModes.includes(requestedMode)) {
      throw new AgentRuntimeError(
        'ENGINE_FAILURE',
        `Execution mode '${requestedMode}' is not supported by this agent definition.`,
        { requestedMode, supportedModes }
      );
    }

    switch (requestedMode) {
      case 'GEMINI_AI': {
        if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY.trim() === '') {
          if (allowFallback && supportedModes.includes('DETERMINISTIC_ENGINE')) {
            return {
              engine: this.getDeterministicEngine(),
              requestedEngine: 'GEMINI_AI',
              actualEngine: 'DETERMINISTIC_ENGINE',
              fallbackReason: 'GEMINI_API_KEY is not configured in current environment; falling back to DETERMINISTIC_ENGINE.',
            };
          }
          throw new AgentRuntimeError(
            'ENGINE_FAILURE',
            'Cannot execute GEMINI_AI: GEMINI_API_KEY is missing or unconfigured.'
          );
        }
        return {
          engine: this.getGeminiEngine(),
          requestedEngine: 'GEMINI_AI',
          actualEngine: 'GEMINI_AI',
        };
      }

      case 'GROQ_LLM': {
        if (!env.GROQ_API_KEY || env.GROQ_API_KEY.trim() === '') {
          if (allowFallback && supportedModes.includes('DETERMINISTIC_ENGINE')) {
            return {
              engine: this.getDeterministicEngine(),
              requestedEngine: 'GROQ_LLM',
              actualEngine: 'DETERMINISTIC_ENGINE',
              fallbackReason: 'GROQ_API_KEY is not configured in current environment; falling back to DETERMINISTIC_ENGINE.',
            };
          }
          throw new AgentRuntimeError(
            'ENGINE_FAILURE',
            'Cannot execute GROQ_LLM: GROQ_API_KEY is missing or unconfigured.'
          );
        }
        return {
          engine: this.getGroqEngine(),
          requestedEngine: 'GROQ_LLM',
          actualEngine: 'GROQ_LLM',
        };
      }

      case 'DETERMINISTIC_ENGINE': {
        return {
          engine: this.getDeterministicEngine(),
          requestedEngine: 'DETERMINISTIC_ENGINE',
          actualEngine: 'DETERMINISTIC_ENGINE',
        };
      }

      default: {
        throw new AgentRuntimeError(
          'ENGINE_FAILURE',
          `Unknown execution mode: '${requestedMode}'. Valid modes are GEMINI_AI, GROQ_LLM, DETERMINISTIC_ENGINE.`
        );
      }
    }
  }

  private getGeminiEngine(): GeminiEngine {
    if (!this.geminiEngine) {
      this.geminiEngine = new GeminiEngine();
    }
    return this.geminiEngine;
  }

  private getGroqEngine(): GroqEngine {
    if (!this.groqEngine) {
      this.groqEngine = new GroqEngine();
    }
    return this.groqEngine;
  }

  private getDeterministicEngine(): DeterministicEngine {
    if (!this.deterministicEngine) {
      this.deterministicEngine = new DeterministicEngine();
    }
    return this.deterministicEngine;
  }
}

export const agentEngineResolver = new AgentEngineResolver();
