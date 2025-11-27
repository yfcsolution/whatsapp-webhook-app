import fs from 'fs';
import path from 'path';

export class ContactManager {
  static getContactStorage(phoneNumber) {
    // Clean phone number for filesystem safety
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const basePath = path.join(process.cwd(), 'data', 'contacts', cleanNumber);
    
    // Ensure directory exists
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }

    return {
      basePath,
      getPath: (...subpaths) => path.join(basePath, ...subpaths),
      ensureDir: (dirName) => {
        const dirPath = path.join(basePath, dirName);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        return dirPath;
      }
    };
  }

  static getAllContacts() {
    const contactsPath = path.join(process.cwd(), 'data', 'contacts');
    if (!fs.existsSync(contactsPath)) {
      return [];
    }
    
    try {
      return fs.readdirSync(contactsPath).filter(item => {
        const itemPath = path.join(contactsPath, item);
        return fs.statSync(itemPath).isDirectory();
      });
    } catch (error) {
      console.error('Error reading contacts directory:', error);
      return [];
    }
  }

  static saveContactInfo(phoneNumber, contactData) {
    try {
      const storage = this.getContactStorage(phoneNumber);
      const infoFile = storage.getPath('contact-info.json');
      
      const existingData = fs.existsSync(infoFile) 
        ? JSON.parse(fs.readFileSync(infoFile, 'utf8'))
        : {};
      
      const updatedData = { 
        ...existingData, 
        ...contactData, 
        lastUpdated: new Date().toISOString(),
        phoneNumber: phoneNumber
      };
      
      fs.writeFileSync(infoFile, JSON.stringify(updatedData, null, 2));
      return updatedData;
    } catch (error) {
      console.error('Error saving contact info:', error);
      return null;
    }
  }

  static getContactInfo(phoneNumber) {
    try {
      const storage = this.getContactStorage(phoneNumber);
      const infoFile = storage.getPath('contact-info.json');
      
      if (fs.existsSync(infoFile)) {
        return JSON.parse(fs.readFileSync(infoFile, 'utf8'));
      }
      return { phoneNumber, name: 'Unknown' };
    } catch (error) {
      console.error('Error reading contact info:', error);
      return { phoneNumber, name: 'Unknown' };
    }
  }
}