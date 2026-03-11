import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, subDays, parseISO, isSameDay } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { taskService } from '../services/taskService';
import { Task } from '../types';

export const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      const uid = user?.uid || JSON.parse(localStorage.getItem('mock_user') || '{}').uid;
      if (uid) {
        try {
          const fetchedTasks = await taskService.getTasks(uid);
          setTasks(fetchedTasks);
        } catch (error) {
          console.error("Error fetching tasks:", error);
        }
      }
      setLoading(false);
    };

    fetchTasks();
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading analytics...</div>;
  }

  // Calculate Weekly Productivity Data
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      date,
      name: format(date, 'EEE'),
      completed: tasks.filter(t => t.status === 'Completed' && isSameDay(parseISO(t.dueDate), date)).length,
      pending: tasks.filter(t => t.status === 'Pending' && isSameDay(parseISO(t.dueDate), date)).length,
    };
  });

  // Calculate Category Distribution
  const categoryData = [
    { name: 'Work', value: tasks.filter(t => t.category === 'Work').length },
    { name: 'Study', value: tasks.filter(t => t.category === 'Study').length },
    { name: 'Personal', value: tasks.filter(t => t.category === 'Personal').length },
    { name: 'Health', value: tasks.filter(t => t.category === 'Health').length },
  ].filter(d => d.value > 0);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

  const totalCompleted = tasks.filter(t => t.status === 'Completed').length;
  const totalPending = tasks.filter(t => t.status === 'Pending').length;
  const completionRate = tasks.length > 0 ? Math.round((totalCompleted / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Analytics</h1>
        <p className="text-neutral-500 text-sm mt-1">Track your productivity and task completion.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="text-4xl font-bold text-indigo-600 mb-2">{totalCompleted}</div>
          <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Tasks Completed</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="text-4xl font-bold text-amber-500 mb-2">{totalPending}</div>
          <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Tasks Pending</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="text-4xl font-bold text-emerald-500 mb-2">{completionRate}%</div>
          <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Completion Rate</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Chart */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Weekly Productivity</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#737373', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#737373', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f5f5f5' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Tasks by Category</h2>
          {categoryData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-neutral-500 text-sm">
              No task data available for categories.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
