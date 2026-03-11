export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskCategory = 'Work' | 'Study' | 'Personal' | 'Health';
export type TaskStatus = 'Pending' | 'Completed';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  dueDate: string; // ISO string
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  createdAt: string; // ISO string
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
