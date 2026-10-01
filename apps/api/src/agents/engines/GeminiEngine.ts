import { GoogleGenAI } from '@google/genai';
import { AgentEngine, EngineDecision } from './AgentEngine.js';
import { AgentContext } from '../runtime/AgentContext.js';
import { AgentDefinition } from '../runtime/AgentDefinition.js';
import { AgentRuntimeError } from '../runtime/AgentRuntimeError.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export class GeminiEngine implements AgentEngine {
  private client: GoogleGenAI | null = null;
  private readonly modelName: string;

  constructor(apiKey?: string, modelName?: string) {
    const key = apiKey || env.GEMINI_API_KEY;
    this.modelName = modelName || env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (key && key.trim() !== '') {
      try {
        this.client = new GoogleGenAI({ apiKey: key });
      } catch (err) {
        logger.warn('Failed to initialize GoogleGenAI client:', { error: String(err) });
      }
    }
  }

  async execute(context: AgentContext, definition: AgentDefinition): Promise<EngineDecision> {
    if (!this.client) {
      throw new AgentRuntimeError(
        'ENGINE_FAILURE',
        'GeminiEngine is unconfigured: GEMINI_API_KEY is missing or invalid.'
      );
    }

    const promptText = this.buildPrompt(context, definition);

    const callTimeoutMs = 6000;
    let timerId: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timerId = setTimeout(
        () => reject(new AgentRuntimeError('ENGINE_FAILURE', `Gemini API call timed out after ${callTimeoutMs}ms`)),
        callTimeoutMs
      );
    });

    try {
      const response = await Promise.race([
        this.client.models.generateContent({
          model: this.modelName,
          contents: promptText,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
        timeoutPromise,
      ]);

      const rawText = response.text || '';
      return this.parseDecision(rawText, definition);
    } catch (err) {
      if (err instanceof AgentRuntimeError) throw err;

      const message = err instanceof Error ? err.message : String(err);
      throw new AgentRuntimeError('ENGINE_FAILURE', `Gemini execution failed: ${message}`, {
        model: this.modelName,
      });
    } finally {
      if (timerId) clearTimeout(timerId);
    }
  }

  private buildPrompt(context: AgentContext, definition: AgentDefinition): string {
    return [
      `ROLE & INSTRUCTIONS:`,
      definition.systemInstructions,
      ``,
      `ALLOWED TOOLS (You may ONLY choose from this exact list):`,
      JSON.stringify(definition.allowedTools),
      ``,
      `CURRENT EXECUTION CONTEXT:`,
      JSON.stringify(
        {
          agentId: context.agentId,
          iteration: context.iteration,
          input: context.input,
          previousToolResults: context.previousToolResults,
        },
        null,
        2
      ),
      ``,
      `MANDATORY RESPONSE FORMAT:`,
      `You MUST respond with valid JSON adhering to ONE of these two discriminated schemas:`,
      `Option 1 - If another tool execution is required to complete your task:`,
      `{`,
      `  "type": "TOOL_CALL",`,
      `  "toolName": "<one of the allowed tools>",`,
      `  "input": { ...arguments conforming to the tool input schema... },`,
      `  "rationaleSummary": "<one concise sentence explaining why this tool is needed>"`,
      `}`,
      ``,
      `Option 2 - If you have sufficient information to conclude your bounded task:`,
      `{`,
      `  "type": "FINAL",`,
      `  "result": { ...final structured output meeting the agent output schema... },`,
      `  "rationaleSummary": "<one concise sentence summarizing final decision>"`,
      `}`,
      `Do not output markdown code fences or conversational prose. Output pure JSON only.`,
    ].join('\n');
  }

  private parseDecision(rawText: string, definition: AgentDefinition): EngineDecision {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText.trim());
    } catch {
      // Clean possible markdown fences
      const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        throw new AgentRuntimeError(
          'INVALID_AGENT_DECISION',
          'Failed to parse structured JSON decision from Gemini model response.',
          { rawPreview: rawText.slice(0, 200) }
        );
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new AgentRuntimeError(
        'INVALID_AGENT_DECISION',
        'Model decision must be a non-null JSON object.'
      );
    }

    const obj = parsed as Record<string, unknown>;
    if (obj.type === 'TOOL_CALL') {
      if (typeof obj.toolName !== 'string' || !definition.allowedTools.includes(obj.toolName)) {
        throw new AgentRuntimeError(
          'TOOL_NOT_ALLOWED',
          `Gemini requested tool '${obj.toolName}' which is not in the agent allowlist.`,
          { requestedTool: obj.toolName, allowedTools: definition.allowedTools }
        );
      }
      return {
        type: 'TOOL_CALL',
        toolName: obj.toolName,
        input: (obj.input as any) || {},
        rationaleSummary: typeof obj.rationaleSummary === 'string' ? obj.rationaleSummary : 'Tool call requested.',
      };
    }

    if (obj.type === 'FINAL') {
      return {
        type: 'FINAL',
        result: (obj.result as any) || {},
        rationaleSummary: typeof obj.rationaleSummary === 'string' ? obj.rationaleSummary : 'Task complete.',
      };
    }

    throw new AgentRuntimeError(
      'INVALID_AGENT_DECISION',
      `Unknown decision type '${obj.type}'. Must be 'TOOL_CALL' or 'FINAL'.`
    );
  }
}
