import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/store';
import { VolunteerTask, TaskStatus } from '@/types';
import { AlertCircle, Check, Clock, FileText, Clock as ClockIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export function MyTasksPage() {
  const [location, setLocation] = useLocation();
  const store = useStore();
  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null); // null = checking, true/false = decided

  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completingTask, setCompletingTask] = useState<number | null>(null);
  const [serviceHours, setServiceHours] = useState<string>('');

  // Load and check user authorization - ONLY RUN ONCE
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('My Tasks - Loaded user:', userData);
      
      if (!userData?.id || userData.role !== 'VOLUNTEER') {
        console.log('Not authorized - redirecting to home');
        setIsAuthorized(false);
        // Use setTimeout to ensure state updates complete before redirect
        setTimeout(() => setLocation('/'), 0);
        return;
      }
      
      console.log('Authorized as volunteer');
      setUser(userData);
      setIsAuthorized(true);
    } catch (err) {
      console.error('Auth error:', err);
      setIsAuthorized(false);
      setTimeout(() => setLocation('/'), 0);
    }
  }, []);

  // Load tasks for current volunteer once authorized
  useEffect(() => {
    if (isAuthorized !== true || !user?.id) return;
    
    const loadTasks = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Loading tasks for volunteer:', user.id);
        const volunteerTasks = await store.getTasksByVolunteer(user.id);
        console.log('Volunteer tasks:', volunteerTasks);
        setTasks(volunteerTasks);
      } catch (err) {
        setError('Failed to load your tasks');
        console.error('Task loading error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, [isAuthorized, user?.id, store]);

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    // If completing, show dialog to enter service hours
    if (newStatus === 'Completed') {
      setCompletingTask(taskId);
      setServiceHours('');
      return;
    }
    
    // For other statuses, update directly
    try {
      await store.updateTaskStatus(taskId, newStatus);
      
      // Update local state
      setTasks(
        tasks.map((task) =>
          task.taskId === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      setError('Failed to update task status');
      console.error(err);
    }
  };

  const handleCompleteWithHours = async () => {
    if (!completingTask) return;
    
    const hours = parseFloat(serviceHours) || 0;
    if (hours < 0) {
      setError('Service hours must be 0 or greater');
      return;
    }

    try {
      await store.updateTaskStatus(completingTask, 'Completed', hours);
      
      // Update local state
      setTasks(
        tasks.map((task) =>
          task.taskId === completingTask
            ? { ...task, status: 'Completed', serviceHours: hours }
            : task
        )
      );
      
      setCompletingTask(null);
      setServiceHours('');
    } catch (err) {
      setError('Failed to complete task');
      console.error(err);
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200';
    }
  };

  // Calculate statistics
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const notStartedCount = tasks.filter((t) => t.status === 'Not Started').length;

  // Show loading while checking authorization
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-emerald-50 dark:bg-emerald-950/20 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Return nothing if not authorized (redirect will happen)
  if (isAuthorized === false) {
    return null;
  }

  return (
    <div className="min-h-screen bg-emerald-50 dark:bg-emerald-950/20 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">My Tasks</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Tasks assigned to you by campaign managers</p>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{tasks.length}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Tasks</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{completedCount}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Completed</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{inProgressCount}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">In Progress</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">{notStartedCount}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Not Started</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-red-800 dark:text-red-200">{error}</span>
            </CardContent>
          </Card>
        )}

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Assigned Tasks</CardTitle>
            <CardDescription>Click on a task status to update it</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No tasks assigned yet
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                  Check back later for new task assignments
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.taskId}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Campaign: <span className="font-medium">{task.campaignName}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {getStatusIcon(task.status)}
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleStatusChange(task.taskId, e.target.value as TaskStatus)
                          }
                          className={`px-3 py-1 rounded-full text-xs font-medium border-none cursor-pointer transition-colors ${getStatusColor(
                            task.status
                          )}`}
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{task.description}</p>
                    )}

                    <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        Assigned: {new Date(task.assignedDate).toLocaleDateString()}
                      </span>
                      {task.serviceHours !== undefined && task.serviceHours > 0 && (
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {task.serviceHours} hours
                        </span>
                      )}
                      {task.startDate && (
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          Started: {new Date(task.startDate).toLocaleDateString()}
                        </span>
                      )}
                      {task.endDate && (
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          Due: {new Date(task.endDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Hours Dialog */}
        <Dialog open={completingTask !== null} onOpenChange={() => { setCompletingTask(null); setServiceHours(''); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Service Hours</DialogTitle>
              <DialogDescription>
                How many hours did you volunteer for this task?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Service Hours</label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={serviceHours}
                  onChange={(e) => setServiceHours(e.target.value)}
                  placeholder="Enter hours (e.g., 2.5)"
                  className="mt-1"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                These hours will be recorded as part of your volunteer service record.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setCompletingTask(null); setServiceHours(''); }}>
                Cancel
              </Button>
              <Button onClick={handleCompleteWithHours} className="bg-green-600 hover:bg-green-700">
                <Check className="w-4 h-4 mr-2" />
                Complete with Hours
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default MyTasksPage;
