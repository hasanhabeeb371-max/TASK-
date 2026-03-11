import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task } from '../types';

const TASKS_COLLECTION = 'tasks';

// Local storage fallback for preview without Firebase config
const getLocalTasks = (): Task[] => {
  const tasks = localStorage.getItem('taskflow_tasks');
  return tasks ? JSON.parse(tasks) : [];
};

const saveLocalTasks = (tasks: Task[]) => {
  localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
};

export const taskService = {
  async getTasks(userId: string): Promise<Task[]> {
    if (!db) {
      return getLocalTasks().filter(t => t.userId === userId);
    }
    const q = query(
      collection(db, TASKS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
  },

  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    if (!db) {
      const newTask = { ...task, id: Math.random().toString(36).substring(2, 9) } as Task;
      const tasks = getLocalTasks();
      saveLocalTasks([newTask, ...tasks]);
      return newTask;
    }
    const docRef = await addDoc(collection(db, TASKS_COLLECTION), task);
    return { id: docRef.id, ...task } as Task;
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    if (!db) {
      const tasks = getLocalTasks();
      const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
      saveLocalTasks(updatedTasks);
      return;
    }
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await updateDoc(taskRef, updates);
  },

  async deleteTask(taskId: string): Promise<void> {
    if (!db) {
      const tasks = getLocalTasks();
      saveLocalTasks(tasks.filter(t => t.id !== taskId));
      return;
    }
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await deleteDoc(taskRef);
  }
};
