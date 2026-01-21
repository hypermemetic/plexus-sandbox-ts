/**
 * Incremental streaming parser for tool calls
 *
 * Uses saxes to detect <tool> tags and @streamparser/json to parse JSON content.
 * This allows us to extract tool calls as they stream in, without waiting for
 * the complete response.
 */

import { SaxesParser, SaxesTag } from 'saxes';
import { JSONParser } from '@streamparser/json';
import type { ToolCall } from './types';

export interface ParseResult {
  toolCalls: ToolCall[];
  visibleText: string;
}

/**
 * Incremental parser that extracts <tool> calls from streaming text
 *
 * Usage:
 *   const parser = new ToolCallStreamParser();
 *
 *   for await (const chunk of stream) {
 *     const result = parser.feed(chunk);
 *
 *     // Display clean text to user
 *     console.log(result.visibleText);
 *
 *     // Execute any complete tool calls
 *     for (const call of result.toolCalls) {
 *       await executeTool(call);
 *     }
 *   }
 *
 *   // Get any remaining buffered text
 *   const final = parser.finish();
 */
export class ToolCallStreamParser {
  private saxParser: SaxesParser;
  private jsonParser: JSONParser;

  private insideToolTag = false;
  private insideCodeBlock = false;
  private codeBlockLang = '';
  private codeBlockBuffer = '';
  private toolJsonBuffer = '';
  private textBuffer = '';
  private rawBuffer = '';

  private pendingToolCalls: ToolCall[] = [];
  private toolCallCounter = 0;

  constructor() {
    this.saxParser = new SaxesParser({ fragment: true });
    this.jsonParser = new JSONParser();

    // Handle opening <tool> tag
    this.saxParser.on('opentag', (tag: SaxesTag) => {
      if (tag.name === 'tool') {
        this.insideToolTag = true;
        this.toolJsonBuffer = '';
      }
    });

    // Handle closing </tool> tag
    this.saxParser.on('closetag', (tag: SaxesTag) => {
      if (tag.name === 'tool' && this.insideToolTag) {
        this.insideToolTag = false;

        // Try to parse the JSON content
        try {
          const parsed = JSON.parse(this.toolJsonBuffer.trim());

          // Extract with flexible field names
          const name = parsed.name || parsed.tool_name || parsed.tool;
          const input = parsed.input || parsed.parameters || parsed.params ||
                       parsed.tool_args || parsed.args || {};

          if (name) {
            this.pendingToolCalls.push({
              id: `tool_${Date.now()}_${this.toolCallCounter++}`,
              name,
              input
            });
          }
        } catch (err) {
          // Invalid JSON in tool tag - ignore it
          console.warn('Failed to parse tool JSON:', this.toolJsonBuffer, err);
        }

        this.toolJsonBuffer = '';
      }
    });

    // Handle text content
    this.saxParser.on('text', (text: string) => {
      if (this.insideToolTag) {
        // Accumulate JSON content inside <tool> tags
        this.toolJsonBuffer += text;
      } else {
        // Regular text - buffer it for display
        this.textBuffer += text;
      }
    });
  }

  /**
   * Feed a chunk of text into the parser
   *
   * Returns any complete tool calls found and visible text (with tool tags stripped).
   */
  feed(chunk: string): ParseResult {
    // Write to SAX parser
    this.saxParser.write(chunk);

    // Extract pending results
    const toolCalls = [...this.pendingToolCalls];
    const visibleText = this.textBuffer;

    // Clear buffers
    this.pendingToolCalls = [];
    this.textBuffer = '';

    return { toolCalls, visibleText };
  }

  /**
   * Finish parsing and get any remaining buffered text
   */
  finish(): ParseResult {
    this.saxParser.close();

    const toolCalls = [...this.pendingToolCalls];
    const visibleText = this.textBuffer;

    this.pendingToolCalls = [];
    this.textBuffer = '';

    return { toolCalls, visibleText };
  }

  /**
   * Reset the parser to initial state
   */
  reset(): void {
    this.saxParser = new SaxesParser({ fragment: true });
    this.insideToolTag = false;
    this.toolJsonBuffer = '';
    this.textBuffer = '';
    this.pendingToolCalls = [];
  }
}
