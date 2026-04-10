import { JobApplication } from '../types/job';

export interface StorageAdapter {
  getAll(): Promise<JobApplication[]>;
  upsert(app: JobApplication): Promise<void>;
  remove(id: string): Promise<void>;
  removeAll(): Promise<void>;
  importBatch(apps: JobApplication[]): Promise<void>;
}
