// Simple storage implementation without auth
export interface IStorage {
  // Add storage methods as needed
}

export class MemStorage implements IStorage {
  // Implement storage methods as needed
}

export const storage = new MemStorage();