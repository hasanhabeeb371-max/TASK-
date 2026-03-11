import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, ListTodo, TrendingUp, Plus } from 'lucide-react';
import { format, isToday, isFuture, parseISO } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { taskService } from '../services/taskService';
import { Task } from '../types';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      if (user) {
        try {
          const fetchedTasks = await taskService.getTasks(user.uid);
          setTasks(fetchedTasks);
        } catch (error) {
          console.error("Error fetching tasks:", error);
        } finally {
          setLoading(false);
        }
      } else {
        // Mock user fetch
        const mockUser = localStorage.getItem('mock_user');
        if (mockUser) {
          const { uid } = JSON.parse(mockUser);
          const fetchedTasks = await taskService.getTasks(uid);
          setTasks(fetchedTasks);
        }
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  const todayTasks = tasks.filter(t => isToday(parseISO(t.dueDate)) && t.status !== 'Completed');
  const upcomingTasks = tasks.filter(t => isFuture(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate)) && t.status !== 'Completed');
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const pendingTasks = tasks.filter(t => t.status === 'Pending');

  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Dashboard</h1>
          <p className="text-neutral-500 text-sm mt-1">Here's what's happening with your tasks today.</p>
        </div>
        <Link
          to="/tasks?new=true"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          New Task
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <ListTodo size={20} />
            </div>
            <h3 className="font-medium text-neutral-600 text-sm">Total Tasks</h3>
          </div>
          <p className="text-3xl font-bold text-neutral-900">{tasks.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock size={20} />
            </div>
            <h3 className="font-medium text-neutral-600 text-sm">Pending</h3>
          </div>
          <p className="text-3xl font-bold text-neutral-900">{pendingTasks.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="font-medium text-neutral-600 text-sm">Completed</h3>
          </div>
          <p className="text-3xl font-bold text-neutral-900">{completedTasks.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <TrendingUp size={20} />
            </div>
            <h3 className="font-medium text-neutral-600 text-sm">Completion Rate</h3>
          </div>
          <p className="text-3xl font-bold text-neutral-900">{completionRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Today's Tasks</h2>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
              {todayTasks.length} pending
            </span>
          </div>
          <div className="p-2 flex-1 overflow-y-auto max-h-[400px]">
            {todayTasks.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-sm">
                No tasks due today. Enjoy your day!
              </div>
            ) : (
              <div className="space-y-1">
                {todayTasks.map(task => (
                  <div key={task.id} className="p-3 hover:bg-neutral-50 rounded-xl transition-colors flex items-start gap-3">
                    <div className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 ${
                      task.priority === 'High' ? 'border-red-500' :
                      task.priority === 'Medium' ? 'border-amber-500' : 'border-blue-500'
                    }`} />
                    <div>
                      <h4 className="font-medium text-sm text-neutral-900">{task.title}</h4>
                      <p className="text-xs text-neutral-500 mt-0.5">{task.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Upcoming Tasks</h2>
            <Link to="/tasks" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View all
            </Link>
          </div>
          <div className="p-2 flex-1 overflow-y-auto max-h-[400px]">
            {upcomingTasks.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-sm">
                No upcoming tasks scheduled.
              </div>
            ) : (
              <div className="space-y-1">
                {upcomingTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="p-3 hover:bg-neutral-50 rounded-xl transition-colors flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-medium text-sm text-neutral-900">{task.title}</h4>
                      <p className="text-xs text-neutral-500 mt-0.5">{task.category}</p>
                    </div>
                    <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded-md shrink-0">
                      {format(parseISO(task.dueDate), 'MMM d')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
