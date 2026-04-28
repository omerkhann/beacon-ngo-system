import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/store';
import { Campaign, VolunteerApplication, VolunteerTask, TaskStatus } from '@/types';
import { AlertCircle, Check, Clock, FileText } from 'lucide-react';

export function ManageVolunteersPage() {
  const [location, setLocation] = useLocation();
  const store = useStore();
  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null); // null = checking, true/false = decided

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form state for creating tasks
  const [volunteerId, setVolunteerId] = useState<string>('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [submittingTask, setSubmittingTask] = useState(false);

  // Load and check user authorization - ONLY RUN ONCE
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Manage Volunteers - Loaded user:', userData);
      
      if (!userData?.id || userData.role !== 'CAMPAIGN_MANAGER') {
        console.log('Not authorized - redirecting to home');
        setIsAuthorized(false);
        // Use setTimeout to ensure state updates complete before redirect
        setTimeout(() => setLocation('/'), 0);
        return;
      }
      
      console.log('Authorized as campaign manager');
      setUser(userData);
      setIsAuthorized(true);
    } catch (err) {
      console.error('Auth error:', err);
      setIsAuthorized(false);
      setTimeout(() => setLocation('/'), 0);
    }
  }, []);

  // Load campaigns once authorized
  useEffect(() => {
    if (isAuthorized !== true || !user?.id) return;
    
    const loadCampaigns = async () => {
      try {
        setLoading(true);
        console.log('Loading campaigns for manager:', user.id);
        const allCampaigns = await store.getCampaigns();
        console.log('All campaigns:', allCampaigns);
        
        // Filter to only campaigns managed by this user
        const managerCampaigns = allCampaigns.filter((c: Campaign) => c.managerId === user.id);
        console.log('Manager campaigns:', managerCampaigns);
        
        setCampaigns(managerCampaigns);
        if (managerCampaigns.length > 0) {
          setSelectedCampaignId(managerCampaigns[0].id.toString());
        }
      } catch (err) {
        setError('Failed to load campaigns');
        console.error('Campaign loading error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCampaigns();
  }, [isAuthorized, user?.id, store]);

  // Load applications and tasks when campaign changes
  useEffect(() => {
    const loadCampaignData = async () => {
      if (!selectedCampaignId) return;
      try {
        setLoading(true);
        setError('');
        const campaignId = parseInt(selectedCampaignId);

        // Load volunteer applications for this campaign
        const allApplications = await store.getApplications();
        const campaignApps = allApplications.filter(
          (app: VolunteerApplication) => app.campaignId === campaignId
        );
        setApplications(campaignApps);

        // Load existing tasks for this campaign
        const campaignTasks = await store.getTasksByCampaign(campaignId);
        setTasks(campaignTasks);
      } catch (err) {
        setError('Failed to load campaign data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCampaignData();
  }, [selectedCampaignId, store]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId || !volunteerId || !taskTitle) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmittingTask(true);
      setError('');
      await store.createTask({
        campaignId: parseInt(selectedCampaignId),
        volunteerId: parseInt(volunteerId),
        title: taskTitle,
        description: taskDescription,
      });

      setSuccessMessage(`Task "${taskTitle}" created successfully!`);
      setTaskTitle('');
      setTaskDescription('');
      setVolunteerId('');

      // Reload tasks
      const updatedTasks = await store.getTasksByCampaign(parseInt(selectedCampaignId));
      setTasks(updatedTasks);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to create task');
      console.error(err);
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await store.updateTaskStatus(taskId, newStatus);
      
      // Reload tasks
      const updatedTasks = await store.getTasksByCampaign(parseInt(selectedCampaignId));
      setTasks(updatedTasks);
    } catch (err) {
      setError('Failed to update task status');
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

  const selectedCampaign = campaigns.find((c) => c.id === parseInt(selectedCampaignId));

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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Manage Volunteers</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Create and assign tasks to volunteers</p>

        {/* Campaign selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Select a campaign" />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id.toString()}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-red-800 dark:text-red-200">{error}</span>
            </CardContent>
          </Card>
        )}

        {successMessage && (
          <Card className="mb-6 border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardContent className="pt-6 flex gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-green-800 dark:text-green-200">{successMessage}</span>
            </CardContent>
          </Card>
        )}

        {selectedCampaignId && (
          <>
            {/* Applied Volunteers Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Applied Volunteers</CardTitle>
                <CardDescription>Volunteers who have applied to {selectedCampaign?.name}</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                ) : applications.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">No volunteers have applied yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                            Volunteer Name
                          </th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                            Skill
                          </th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                            Status
                          </th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                            Applied Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.map((app) => (
                          <tr key={app.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/20">
                            <td className="py-3 px-3 text-gray-900 dark:text-white">
                              {app.volunteerName || `Volunteer ${app.volunteerId}`}
                            </td>
                            <td className="py-3 px-3 text-gray-700 dark:text-gray-300">{app.skill}</td>
                            <td className="py-3 px-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                app.status === 'APPROVED'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                                  : app.status === 'REJECTED'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-gray-700 dark:text-gray-300">
                              {new Date(app.appliedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Create Task Form */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Create New Task</CardTitle>
                <CardDescription>Assign a task to a volunteer</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="volunteer-select">Assign to Volunteer *</Label>
                      <Select value={volunteerId} onValueChange={setVolunteerId}>
                        <SelectTrigger id="volunteer-select">
                          <SelectValue placeholder="Select a volunteer" />
                        </SelectTrigger>
                        <SelectContent>
                          {applications
                            .filter((app) => app.status === 'APPROVED')
                            .map((app) => (
                              <SelectItem key={app.volunteerId} value={app.volunteerId.toString()}>
                                {app.volunteerName || `Volunteer ${app.volunteerId}`}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="task-title">Task Title *</Label>
                      <Input
                        id="task-title"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        placeholder="e.g., Water Distribution"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="task-description">Task Description</Label>
                    <textarea
                      id="task-description"
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      placeholder="Describe the task..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submittingTask || !volunteerId || !taskTitle}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {submittingTask ? 'Creating...' : 'Create Task'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Existing Tasks Section */}
            <Card>
              <CardHeader>
                <CardTitle>Task Assignments</CardTitle>
                <CardDescription>Tasks assigned to volunteers in this campaign</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                ) : tasks.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">No tasks assigned yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                            Volunteer
                          </th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                            Task Title
                          </th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                            Description
                          </th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                            Status
                          </th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                            Assigned Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map((task) => (
                          <tr key={task.taskId} className="border-b border-gray-200 dark:border-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/20">
                            <td className="py-3 px-3 text-gray-900 dark:text-white">
                              {task.volunteerName || `Volunteer ${task.volunteerId}`}
                            </td>
                            <td className="py-3 px-3 text-gray-900 dark:text-white font-medium">{task.title}</td>
                            <td className="py-3 px-3 text-gray-700 dark:text-gray-300">{task.description}</td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(task.status)}
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  task.status === 'Completed'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                                    : task.status === 'In Progress'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200'
                                }`}>
                                  {task.status}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-gray-700 dark:text-gray-300">
                              {new Date(task.assignedDate).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default ManageVolunteersPage;
