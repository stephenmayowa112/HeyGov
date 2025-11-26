import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db';
import { contacts } from '../db/schema';
import { eq, or, like } from 'drizzle-orm';

const router = Router();

// Initialize Anthropic (Claude) client
if (!process.env.CLAUDE_API_KEY) {
  console.error('❌ CLAUDE_API_KEY is not set in environment variables');
  console.error('Please add CLAUDE_API_KEY to your .env file');
}

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || '',
});

// Tool definitions for Claude function calling
const tools: Anthropic.Tool[] = [
  {
    name: 'upsertContact',
    description: 'Create a new contact or update an existing one. Use this when the user wants to add someone or mentions meeting/contacting someone.',
    input_schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The full name of the contact',
        },
        email: {
          type: 'string',
          description: 'The email address of the contact',
        },
        phone: {
          type: 'string',
          description: 'The phone number of the contact',
        },
        new_notes: {
          type: 'string',
          description: 'New notes or context about this interaction to append',
        },
        interaction_date: {
          type: 'string',
          description: 'ISO date string of when this interaction occurred (defaults to now)',
        },
      },
    },
  },
  {
    name: 'searchContacts',
    description: 'Search for contacts by name, email, or notes. Use this when the user asks a question about their contacts.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query to match against name, email, or notes',
        },
      },
      required: ['query'],
    },
  },
];

// Tool implementation: upsertContact
async function upsertContact(args: {
  name?: string;
  email?: string;
  phone?: string;
  new_notes?: string;
  interaction_date?: string;
}): Promise<string> {
  try {
    const { name, email, phone, new_notes, interaction_date } = args;

    // Validate: at least one of name or email must be provided
    if (!name && !email) {
      return JSON.stringify({
        success: false,
        error: 'At least one of name or email is required',
      });
    }

    // Try to find existing contact by email or name
    let existingContact = null;

    if (email) {
      existingContact = await db
        .select()
        .from(contacts)
        .where(eq(contacts.email, email))
        .get();
    }

    if (!existingContact && name) {
      existingContact = await db
        .select()
        .from(contacts)
        .where(eq(contacts.name, name))
        .get();
    }

    const interactionTimestamp = interaction_date 
      ? new Date(interaction_date) 
      : new Date();

    if (existingContact) {
      // Update existing contact
      const updatedNotes = existingContact.notes
        ? `${existingContact.notes}\n\n[${interactionTimestamp.toISOString()}] ${new_notes || 'Contact interaction'}`
        : `[${interactionTimestamp.toISOString()}] ${new_notes || 'Contact interaction'}`;

      const updated = await db
        .update(contacts)
        .set({
          name: name || existingContact.name,
          email: email || existingContact.email,
          phone: phone || existingContact.phone,
          notes: updatedNotes,
          lastContactedAt: interactionTimestamp,
        })
        .where(eq(contacts.id, existingContact.id))
        .returning()
        .get();

      return JSON.stringify({
        success: true,
        action: 'updated',
        contact: updated,
      });
    } else {
      // Create new contact
      const initialNotes = new_notes
        ? `[${interactionTimestamp.toISOString()}] ${new_notes}`
        : null;

      const newContact = await db
        .insert(contacts)
        .values({
          name: name || null,
          email: email || null,
          phone: phone || null,
          notes: initialNotes,
          lastContactedAt: interactionTimestamp,
        })
        .returning()
        .get();

      return JSON.stringify({
        success: true,
        action: 'created',
        contact: newContact,
      });
    }
  } catch (error) {
    console.error('Error in upsertContact:', error);
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Tool implementation: searchContacts
async function searchContacts(args: { query: string }): Promise<string> {
  try {
    const { query } = args;
    const searchPattern = `%${query}%`;

    const results = await db
      .select()
      .from(contacts)
      .where(
        or(
          like(contacts.name, searchPattern),
          like(contacts.email, searchPattern),
          like(contacts.notes, searchPattern)
        )
      )
      .all();

    return JSON.stringify({
      success: true,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error in searchContacts:', error);
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// POST / - AI Agent endpoint
router.post('/', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required and must be a string',
      });
    }

    // System prompt with dynamic date
    const todayDate = new Date().toISOString().split('T')[0];
    const systemPrompt = `You are a CRM assistant. Today's date is ${todayDate}. Manage contacts intelligently. If the user implies an action (adding/updating), use the upsert tool. If they ask a question, use the search tool. Always summarize what you did in the final response.`;

    // Call Claude with tool use
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
      tools,
    });

    let finalText = '';
    const toolsUsed: string[] = [];

    // Process tool calls if any
    const toolUseBlocks = message.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
    );

    if (toolUseBlocks.length > 0) {
      // Execute tools and collect results
      const toolResults: Anthropic.MessageParam[] = [
        { role: 'user', content: prompt },
        { role: 'assistant', content: message.content },
      ];

      const resultContent: Anthropic.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        toolsUsed.push(toolUse.name);
        const functionArgs = toolUse.input as any;

        let functionResult: string;

        if (toolUse.name === 'upsertContact') {
          functionResult = await upsertContact(functionArgs);
        } else if (toolUse.name === 'searchContacts') {
          functionResult = await searchContacts(functionArgs);
        } else {
          functionResult = JSON.stringify({
            success: false,
            error: `Unknown function: ${toolUse.name}`,
          });
        }

        resultContent.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: functionResult,
        });
      }

      // Get final response from Claude after tool execution
      toolResults.push({
        role: 'user',
        content: resultContent,
      });

      const finalMessage = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: toolResults,
        tools,
      });

      // Extract text response
      const textBlock = finalMessage.content.find(
        (block): block is Anthropic.TextBlock => block.type === 'text'
      );
      finalText = textBlock?.text || 'Action completed successfully.';
    } else {
      // No tool calls, just return the text response
      const textBlock = message.content.find(
        (block): block is Anthropic.TextBlock => block.type === 'text'
      );
      finalText = textBlock?.text || 'I can help you manage your contacts.';
    }

    res.json({
      success: true,
      response: finalText,
      toolsUsed,
    });
  } catch (error) {
    console.error('Error in agent endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process agent request',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
