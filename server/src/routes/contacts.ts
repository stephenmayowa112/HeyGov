import { Router, Request, Response } from 'express';
import { db } from '../db';
import { contacts } from '../db/schema';
import { eq, or, like, sql } from 'drizzle-orm';

const router = Router();

// GET / - List all contacts (with optional search)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    let result;

    if (q && typeof q === 'string') {
      const searchPattern = `%${q}%`;
      result = await db
        .select()
        .from(contacts)
        .where(
          or(
            like(contacts.name, searchPattern),
            like(contacts.email, searchPattern)
          )
        )
        .all();
    } else {
      result = await db.select().from(contacts).all();
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch contacts',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST / - Create a new contact
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, notes } = req.body;

    // Validate: at least one of name or email must be provided
    if (!name && !email) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: At least one of name or email is required'
      });
    }

    const newContact = await db
      .insert(contacts)
      .values({
        name: name || null,
        email: email || null,
        phone: phone || null,
        notes: notes || null,
        lastContactedAt: null,
      })
      .returning()
      .get();

    res.status(201).json({ success: true, data: newContact });
  } catch (error) {
    console.error('Error creating contact:', error);
    
    // Handle unique constraint violation for email
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return res.status(409).json({
        success: false,
        error: 'A contact with this email already exists'
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Failed to create contact',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /:id - Update a contact
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, notes, lastContactedAt } = req.body;

    const contactId = parseInt(id, 10);
    if (isNaN(contactId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid contact ID'
      });
    }

    // Build update object dynamically
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (notes !== undefined) updateData.notes = notes;
    if (lastContactedAt !== undefined) {
      updateData.lastContactedAt = lastContactedAt ? new Date(lastContactedAt) : null;
    }

    const updatedContact = await db
      .update(contacts)
      .set(updateData)
      .where(eq(contacts.id, contactId))
      .returning()
      .get();

    if (!updatedContact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    res.json({ success: true, data: updatedContact });
  } catch (error) {
    console.error('Error updating contact:', error);
    
    // Handle unique constraint violation for email
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return res.status(409).json({
        success: false,
        error: 'A contact with this email already exists'
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Failed to update contact',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /:id - Delete a contact
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const contactId = parseInt(id, 10);
    if (isNaN(contactId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid contact ID'
      });
    }

    const deletedContact = await db
      .delete(contacts)
      .where(eq(contacts.id, contactId))
      .returning()
      .get();

    if (!deletedContact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    res.json({ success: true, data: deletedContact });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete contact',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
