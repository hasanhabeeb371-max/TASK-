import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, Check, X, Calendar, Tag, AlertCircle, CheckSquare, ChevronDown, ChevronRight } from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { taskService } from '../services/taskService';
import { Task, TaskCategory, TaskPriority, TaskStatus } from '../types';

export const Tasks: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [category, setCategory] = useState<TaskCategory>('Work');

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsModalOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const uid = user?.uid || JSON.parse(localStorage.getItem('mock_user') || '{}').uid;
      if (uid) {
        const fetchedTasks = await taskService.getTasks(uid);
        setTasks(fetchedTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const toggleExpand = (taskId: string) => {
    setExpandedTaskId(prev => prev === taskId ? null : taskId);
  };

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setDescription(task.description);
      setDueDate(task.dueDate.split('T')[0]);
      setPriority(task.priority);
      setCategory(task.category);
    } else {
      setEditingTask(null);
      setTitle('');
      setDescription('');
      setDueDate(format(new Date(), 'yyyy-MM-dd'));
      setPriority('Medium');
      setCategory('Work');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const uid = user?.uid || JSON.parse(localStorage.getItem('mock_user') || '{}').uid;
    if (!uid) return;

    try {
      if (editingTask) {
        await taskService.updateTask(editingTask.id, {
          title,
          description,
          dueDate: new Date(dueDate).toISOString(),
          priority,
          category,
        });
      } else {
        await taskService.createTask({
          userId: uid,
          title,
          description,
          dueDate: new Date(dueDate).toISOString(),
          priority,
          category,
          status: 'Pending',
          createdAt: new Date().toISOString(),
        });
      }
      fetchTasks();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    try {
      const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      await taskService.updateTask(task.id, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId);
        fetchTasks();
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || task.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Tasks</h1>
          <p className="text-neutral-500 text-sm mt-1">Manage and organize your to-dos.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          New Task
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-neutral-400" />
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-shadow"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="block w-full md:w-auto pl-3 pr-10 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-shadow bg-white"
          >
            <option value="All">All Categories</option>
            <option value="Work">Work</option>
            <option value="Study">Study</option>
            <option value="Personal">Personal</option>
            <option value="Health">Health</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="block w-full md:w-auto pl-3 pr-10 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-shadow bg-white"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-neutral-500">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
              <CheckSquare size={32} className="text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-1">No tasks found</h3>
            <p className="text-neutral-500 text-sm max-w-sm">
              {searchQuery || filterCategory !== 'All' || filterStatus !== 'All' 
                ? "Try adjusting your filters or search query to find what you're looking for."
                : "You don't have any tasks yet. Create one to get started!"}
            </p>
            {!(searchQuery || filterCategory !== 'All' || filterStatus !== 'All') && (
              <button
                onClick={() => handleOpenModal()}
                className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-medium text-sm hover:bg-indigo-100 transition-colors"
              >
                <Plus size={18} />
                Create your first task
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="py-3 px-4 font-medium text-xs text-neutral-500 uppercase tracking-wider w-12">Status</th>
                  <th className="py-3 px-4 font-medium text-xs text-neutral-500 uppercase tracking-wider">Task</th>
                  <th className="py-3 px-4 font-medium text-xs text-neutral-500 uppercase tracking-wider">Category</th>
                  <th className="py-3 px-4 font-medium text-xs text-neutral-500 uppercase tracking-wider">Due Date</th>
                  <th className="py-3 px-4 font-medium text-xs text-neutral-500 uppercase tracking-wider">Priority</th>
                  <th className="py-3 px-4 font-medium text-xs text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredTasks.map(task => {
                  const isOverdue = isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate)) && task.status !== 'Completed';
                  const isExpanded = expandedTaskId === task.id;
                  
                  return (
                    <React.Fragment key={task.id}>
                      <tr 
                        onClick={() => toggleExpand(task.id)}
                        className={`cursor-pointer hover:bg-neutral-50 transition-colors ${task.status === 'Completed' ? 'opacity-60' : ''}`}
                      >
                        <td className="py-3 px-4 align-middle">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleStatus(task); }}
                            className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors ${
                              task.status === 'Completed'
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-neutral-300 hover:border-indigo-500 text-transparent hover:text-indigo-200'
                            }`}
                          >
                            <Check size={14} strokeWidth={3} />
                          </button>
                        </td>
                        <td className="py-3 px-4 align-middle">
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown size={16} className="text-neutral-400 shrink-0" /> : <ChevronRight size={16} className="text-neutral-400 shrink-0" />}
                            <div>
                              <p className={`font-medium text-sm text-neutral-900 ${task.status === 'Completed' ? 'line-through text-neutral-500' : ''}`}>
                                {task.title}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 align-middle">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-600">
                            <Tag size={12} />
                            {task.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 align-middle">
                          <div className={`flex items-center gap-1.5 text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-neutral-600'}`}>
                            <Calendar size={14} />
                            {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                            {isOverdue && <AlertCircle size={14} className="text-red-500 ml-1" />}
                          </div>
                        </td>
                        <td className="py-3 px-4 align-middle">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            task.priority === 'High' ? 'bg-red-50 text-red-700 border-red-100' :
                            task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-blue-50 text-blue-700 border-blue-100'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4 align-middle text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleOpenModal(task); }}
                              className="p-1.5 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                              className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-neutral-50/50 border-b border-neutral-100">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="pl-12 pr-4">
                              <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Description</h4>
                              <p className="text-sm text-neutral-700 whitespace-pre-wrap mb-4">
                                {task.description || <span className="italic text-neutral-400">No description provided.</span>}
                              </p>
                              <div className="flex items-center gap-6 text-xs text-neutral-500">
                                <div>
                                  <span className="font-medium">Created:</span> {format(parseISO(task.createdAt), 'MMM d, yyyy h:mm a')}
                                </div>
                                <div>
                                  <span className="font-medium">Status:</span> {task.status}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-neutral-900">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="task-form" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Task Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full px-3 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-shadow"
                    placeholder="E.g., Finish quarterly report"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Description (Optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="block w-full px-3 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-shadow resize-none"
                    placeholder="Add details about this task..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TaskPriority)}
                      className="block w-full px-3 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-shadow bg-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Work', 'Study', 'Personal', 'Health'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat as TaskCategory)}
                        className={`py-2 px-3 rounded-xl text-sm font-medium border transition-colors ${
                          category === cat
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                            : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="task-form"
                className="px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
              >
                {editingTask ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
