"use client"
import React, { useState, useEffect } from 'react';
import { Plus, Users, Calendar, BarChart3, FileText, Edit, Trash2, Save, X } from 'lucide-react';

// Types
interface TeamMember {
  id: string;
  name: string;
  role: string;
  active: boolean;
}

interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  teamMembers: string[];
  status: 'active' | 'completed' | 'planned';
}

interface StandupEntry {
  id: string;
  date: string;
  sprintId: string;
  memberId: string;
  yesterday: string;
  today: string;
  blockers: string;
}

const ScrumStandupTracker = () => {
  // State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [standupEntries, setStandupEntries] = useState<StandupEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);

  // Modal states
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Form states
  const [sprintForm, setSprintForm] = useState({
    name: '', startDate: '', endDate: '', teamMembers: [] as string[]
  });
  const [memberForm, setMemberForm] = useState({ name: '', role: '' });

  // Initialize with sample data
  useEffect(() => {
    const sampleMembers: TeamMember[] = [
      { id: '1', name: 'John Doe', role: 'Frontend Developer', active: true },
      { id: '2', name: 'Jane Smith', role: 'Backend Developer', active: true },
      { id: '3', name: 'Mike Johnson', role: 'QA Engineer', active: true },
    ];

    const sampleSprints: Sprint[] = [
      {
        id: '1',
        name: 'Sprint 1 - User Authentication',
        startDate: '2024-08-01',
        endDate: '2024-08-14',
        teamMembers: ['1', '2', '3'],
        status: 'active'
      }
    ];

    setTeamMembers(sampleMembers);
    setSprints(sampleSprints);
    setActiveSprint(sampleSprints[0]);
  }, []);

  // Helper functions
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const getMemberName = (id: string) => 
    teamMembers.find(m => m.id === id)?.name || 'Unknown';

  const getTodayEntries = () => 
    standupEntries.filter(entry => 
      entry.date === selectedDate && entry.sprintId === activeSprint?.id
    );

  const getSprintMembers = () => 
    teamMembers.filter(member => 
      activeSprint?.teamMembers.includes(member.id) && member.active
    );

  // CRUD Operations
  const handleSaveSprint = () => {
    if (editingSprint) {
      setSprints(prev => prev.map(s => s.id === editingSprint.id ? 
        { ...editingSprint, ...sprintForm } : s));
    } else {
      const newSprint: Sprint = {
        id: generateId(),
        ...sprintForm,
        status: 'planned'
      };
      setSprints(prev => [...prev, newSprint]);
    }
    setShowSprintModal(false);
    setEditingSprint(null);
    setSprintForm({ name: '', startDate: '', endDate: '', teamMembers: [] });
  };

  const handleSaveMember = () => {
    if (editingMember) {
      setTeamMembers(prev => prev.map(m => m.id === editingMember.id ?
        { ...editingMember, ...memberForm } : m));
    } else {
      const newMember: TeamMember = {
        id: generateId(),
        ...memberForm,
        active: true
      };
      setTeamMembers(prev => [...prev, newMember]);
    }
    setShowMemberModal(false);
    setEditingMember(null);
    setMemberForm({ name: '', role: '' });
  };

  const handleStandupUpdate = (memberId: string, field: string, value: string) => {
    const existingEntry = standupEntries.find(e => 
      e.date === selectedDate && e.memberId === memberId && e.sprintId === activeSprint?.id
    );

    if (existingEntry) {
      setStandupEntries(prev => prev.map(e => 
        e.id === existingEntry.id ? { ...e, [field]: value } : e
      ));
    } else {
      const newEntry: StandupEntry = {
        id: generateId(),
        date: selectedDate,
        sprintId: activeSprint?.id || '',
        memberId,
        yesterday: field === 'yesterday' ? value : '',
        today: field === 'today' ? value : '',
        blockers: field === 'blockers' ? value : ''
      };
      setStandupEntries(prev => [...prev, newEntry]);
    }
  };

  const getEntryValue = (memberId: string, field: string) => {
    const entry = standupEntries.find(e => 
      e.date === selectedDate && e.memberId === memberId && e.sprintId === activeSprint?.id
    );
    return entry ? entry[field as keyof StandupEntry] : '';
  };

  // Components
  const Navigation = () => (
    <nav className="bg-blue-600 text-white p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Daily Standup Tracker</h1>
        <div className="flex space-x-4">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'standup', label: 'Daily Standup', icon: Users },
            { id: 'sprints', label: 'Sprints', icon: Calendar },
            { id: 'reports', label: 'Reports', icon: FileText }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded ${
                activeTab === id ? 'bg-blue-800' : 'hover:bg-blue-500'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );

  const Dashboard = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Active Sprint</h3>
          <p className="text-2xl font-bold text-blue-600">
            {activeSprint?.name || 'No active sprint'}
          </p>
          {activeSprint && (
            <p className="text-sm text-gray-500">
              {activeSprint.startDate} to {activeSprint.endDate}
            </p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Team Members</h3>
          <p className="text-2xl font-bold text-green-600">
            {teamMembers.filter(m => m.active).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Today&apos;s Entries</h3>
          <p className="text-2xl font-bold text-purple-600">
            {getTodayEntries().length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {standupEntries.slice(-5).reverse().map(entry => (
            <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <span className="font-medium">{getMemberName(entry.memberId)}</span>
                <span className="text-gray-500 ml-2">updated standup for {entry.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const StandupView = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Daily Standup</h2>
        <div className="flex items-center space-x-4">
          <label className="font-medium">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
      </div>

      {activeSprint ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">{activeSprint.name}</h3>
          <div className="space-y-6">
            {getSprintMembers().map(member => (
              <div key={member.id} className="border rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-3">{member.name} - {member.role}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What did you do yesterday?
                    </label>
                    <textarea
                      value={getEntryValue(member.id, 'yesterday') as string}
                      onChange={(e) => handleStandupUpdate(member.id, 'yesterday', e.target.value)}
                      className="w-full border rounded px-3 py-2 h-24"
                      placeholder="Enter yesterday's work..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What will you do today?
                    </label>
                    <textarea
                      value={getEntryValue(member.id, 'today') as string}
                      onChange={(e) => handleStandupUpdate(member.id, 'today', e.target.value)}
                      className="w-full border rounded px-3 py-2 h-24"
                      placeholder="Enter today's plan..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Any blockers or impediments?
                    </label>
                    <textarea
                      value={getEntryValue(member.id, 'blockers') as string}
                      onChange={(e) => handleStandupUpdate(member.id, 'blockers', e.target.value)}
                      className="w-full border rounded px-3 py-2 h-24"
                      placeholder="Enter any blockers..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">No active sprint selected. Please create or select a sprint first.</p>
        </div>
      )}
    </div>
  );

  const SprintsView = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Sprint Management</h2>
        <div className="space-x-2">
          <button
            onClick={() => {
              setShowMemberModal(true);
              setEditingMember(null);
              setMemberForm({ name: '', role: '' });
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Member</span>
          </button>
          <button
            onClick={() => {
              setShowSprintModal(true);
              setEditingSprint(null);
              setSprintForm({ name: '', startDate: '', endDate: '', teamMembers: [] });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>New Sprint</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Sprints</h3>
          <div className="space-y-3">
            {sprints.map(sprint => (
              <div key={sprint.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{sprint.name}</h4>
                    <p className="text-sm text-gray-500">
                      {sprint.startDate} to {sprint.endDate}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      sprint.status === 'active' ? 'bg-green-100 text-green-800' :
                      sprint.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {sprint.status}
                    </span>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => setActiveSprint(sprint)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Activate
                    </button>
                    <button
                      onClick={() => {
                        setEditingSprint(sprint);
                        setSprintForm({
                          name: sprint.name,
                          startDate: sprint.startDate,
                          endDate: sprint.endDate,
                          teamMembers: sprint.teamMembers
                        });
                        setShowSprintModal(true);
                      }}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Team Members</h3>
          <div className="space-y-3">
            {teamMembers.map(member => (
              <div key={member.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{member.name}</h4>
                    <p className="text-sm text-gray-500">{member.role}</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      member.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {member.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setEditingMember(member);
                      setMemberForm({ name: member.name, role: member.role });
                      setShowMemberModal(true);
                    }}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ReportsView = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Reports</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Standup History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Member</th>
                <th className="px-4 py-2 text-left">Yesterday</th>
                <th className="px-4 py-2 text-left">Today</th>
                <th className="px-4 py-2 text-left">Blockers</th>
              </tr>
            </thead>
            <tbody>
              {standupEntries.slice().reverse().map(entry => (
                <tr key={entry.id} className="border-t">
                  <td className="px-4 py-2">{entry.date}</td>
                  <td className="px-4 py-2">{getMemberName(entry.memberId)}</td>
                  <td className="px-4 py-2 max-w-xs truncate">{entry.yesterday}</td>
                  <td className="px-4 py-2 max-w-xs truncate">{entry.today}</td>
                  <td className="px-4 py-2 max-w-xs truncate">{entry.blockers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Modals
  const SprintModal = () => showSprintModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {editingSprint ? 'Edit Sprint' : 'New Sprint'}
        </h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Sprint Name"
            value={sprintForm.name}
            onChange={(e) => setSprintForm({ ...sprintForm, name: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="date"
            placeholder="Start Date"
            value={sprintForm.startDate}
            onChange={(e) => setSprintForm({ ...sprintForm, startDate: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="date"
            placeholder="End Date"
            value={sprintForm.endDate}
            onChange={(e) => setSprintForm({ ...sprintForm, endDate: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team Members</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {teamMembers.filter(m => m.active).map(member => (
                <label key={member.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sprintForm.teamMembers.includes(member.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSprintForm({
                          ...sprintForm,
                          teamMembers: [...sprintForm.teamMembers, member.id]
                        });
                      } else {
                        setSprintForm({
                          ...sprintForm,
                          teamMembers: sprintForm.teamMembers.filter(id => id !== member.id)
                        });
                      }
                    }}
                    className="mr-2"
                  />
                  {member.name} - {member.role}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex space-x-2 mt-6">
          <button
            onClick={handleSaveSprint}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center space-x-2"
          >
            <Save size={16} />
            <span>Save</span>
          </button>
          <button
            onClick={() => setShowSprintModal(false)}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 flex items-center justify-center space-x-2"
          >
            <X size={16} />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );

  const MemberModal = () => showMemberModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {editingMember ? 'Edit Member' : 'New Team Member'}
        </h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={memberForm.name}
            onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Role (e.g., Frontend Developer)"
            value={memberForm.role}
            onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex space-x-2 mt-6">
          <button
            onClick={handleSaveMember}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center justify-center space-x-2"
          >
            <Save size={16} />
            <span>Save</span>
          </button>
          <button
            onClick={() => setShowMemberModal(false)}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 flex items-center justify-center space-x-2"
          >
            <X size={16} />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'standup' && <StandupView />}
      {activeTab === 'sprints' && <SprintsView />}
      {activeTab === 'reports' && <ReportsView />}
      <SprintModal />
      <MemberModal />
    </div>
  );
};

export default ScrumStandupTracker;