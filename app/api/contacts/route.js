import { NextResponse } from 'next/server';
import { ContactManager } from '@/lib/contactManager';

export async function GET() {
  try {
    const allContacts = ContactManager.getAllContacts();
    
    const contactsWithInfo = allContacts.map(contactId => {
      const storage = ContactManager.getContactStorage(contactId);
      return {
        contactId: contactId,
        storagePath: storage.basePath
      };
    });

    return NextResponse.json({
      success: true,
      totalContacts: allContacts.length,
      contacts: contactsWithInfo
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}