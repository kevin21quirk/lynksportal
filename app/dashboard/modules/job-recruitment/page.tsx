'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Briefcase, Users, Eye, Loader2, MapPin, Clock, DollarSign } from 'lucide-react';

interface JobListing {
  id: number;
  title: string;
  slug: string;
  description: string;
  employment_type: string;
  location: string;
  remote_option: string;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  salary_period: string;
  status: string;
  applications_count: number;
  created_at: string;
}

interface Application {
  id: number;
  job_listing_id: number;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  resume_url: string;
  cover_letter: string;
  linkedin_url: string;
  portfolio_url: string;
  status: string;
  rating: number;
  notes: string;
  applied_at: string;
}

export default function RecruitmentManagementPage() {
  const router = useRouter();
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');
  
  // Job form state
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobListing | null>(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    employment_type: 'full-time',
    location: '',
    remote_option: 'on-site',
    salary_min: 0,
    salary_max: 0,
    salary_currency: 'GBP',
    salary_period: 'yearly',
    requirements: '',
    responsibilities: '',
    benefits: '',
    application_deadline: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/login');
        return;
      }

      const user = JSON.parse(userData);
      const userId = user.id;

      const businessesRes = await fetch(`/api/businesses?userId=${userId}`);
      const businesses = await businessesRes.json();
      
      if (!businesses || businesses.length === 0) {
        setLoading(false);
        return;
      }

      const bId = businesses[0].id;
      setBusinessId(bId);

      // Check if subscribed to recruitment module
      const subsRes = await fetch(`/api/business-subscriptions?businessId=${bId}`);
      const subscriptions = await subsRes.json();
      
      const hasRecruitment = subscriptions.some((sub: any) => 
        sub.module_slug === 'job-recruitment' && 
        (sub.status === 'active' || sub.status === 'trial')
      );

      if (!hasRecruitment) {
        router.push('/dashboard/modules');
        return;
      }

      await loadJobListings(bId);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJobListings = async (bId: number) => {
    const res = await fetch(`/api/job-listings?businessId=${bId}`);
    const data = await res.json();
    setJobListings(data);
  };

  const loadApplications = async (jobId: number) => {
    const res = await fetch(`/api/job-applications?jobListingId=${jobId}`);
    const data = await res.json();
    setApplications(data);
  };

  const handleSaveJob = async () => {
    try {
      const url = '/api/job-listings';
      const method = editingJob ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...jobForm,
          businessId,
          id: editingJob?.id,
          employmentType: jobForm.employment_type,
          remoteOption: jobForm.remote_option,
          salaryMin: jobForm.salary_min,
          salaryMax: jobForm.salary_max,
          salaryCurrency: jobForm.salary_currency,
          salaryPeriod: jobForm.salary_period,
          applicationDeadline: jobForm.application_deadline || null
        })
      });

      if (response.ok) {
        await loadJobListings(businessId!);
        setShowJobForm(false);
        setEditingJob(null);
        resetJobForm();
      }
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Failed to save job listing');
    }
  };

  const handleDeleteJob = async (id: number) => {
    if (!confirm('Are you sure you want to delete this job listing?')) return;

    try {
      await fetch(`/api/job-listings?id=${id}`, { method: 'DELETE' });
      await loadJobListings(businessId!);
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const handleEditJob = (job: JobListing) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      description: job.description,
      employment_type: job.employment_type,
      location: job.location,
      remote_option: job.remote_option,
      salary_min: job.salary_min || 0,
      salary_max: job.salary_max || 0,
      salary_currency: job.salary_currency,
      salary_period: job.salary_period,
      requirements: '',
      responsibilities: '',
      benefits: '',
      application_deadline: ''
    });
    setShowJobForm(true);
  };

  const resetJobForm = () => {
    setJobForm({
      title: '',
      description: '',
      employment_type: 'full-time',
      location: '',
      remote_option: 'on-site',
      salary_min: 0,
      salary_max: 0,
      salary_currency: 'GBP',
      salary_period: 'yearly',
      requirements: '',
      responsibilities: '',
      benefits: '',
      application_deadline: ''
    });
  };

  const handleViewApplications = async (job: JobListing) => {
    setSelectedJob(job);
    await loadApplications(job.id);
    setActiveTab('applications');
  };

  const handleUpdateApplicationStatus = async (appId: number, status: string) => {
    try {
      await fetch('/api/job-applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId, status })
      });
      
      if (selectedJob) {
        await loadApplications(selectedJob.id);
      }
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'new': '#3b82f6',
      'reviewing': '#f59e0b',
      'shortlisted': '#8b5cf6',
      'interviewed': '#06b6d4',
      'offered': '#10b981',
      'rejected': '#ef4444',
      'withdrawn': '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0c0f17' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#dbf72c' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0c0f17' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/modules')}
            className="mb-4 px-4 py-2 rounded-lg text-white hover:bg-gray-800 transition-colors"
          >
            ← Back to Modules
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">Job Listings & Recruitment</h1>
          <p className="text-gray-400 text-lg">
            Post jobs and manage applications
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'jobs'
                ? 'text-white border-b-2'
                : 'text-gray-400 hover:text-white'
            }`}
            style={{ borderColor: activeTab === 'jobs' ? '#dbf72c' : 'transparent' }}
          >
            Job Listings
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'applications'
                ? 'text-white border-b-2'
                : 'text-gray-400 hover:text-white'
            }`}
            style={{ borderColor: activeTab === 'applications' ? '#dbf72c' : 'transparent' }}
          >
            Applications {selectedJob && `(${selectedJob.title})`}
          </button>
        </div>

        {/* Job Listings Tab */}
        {activeTab === 'jobs' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Job Listings</h2>
              <button
                onClick={() => {
                  resetJobForm();
                  setEditingJob(null);
                  setShowJobForm(true);
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold"
                style={{ backgroundColor: '#dbf72c', color: '#0c0f17' }}
              >
                <Plus size={20} />
                Post New Job
              </button>
            </div>

            {/* Job Form Modal */}
            {showJobForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <h3 className="text-2xl font-bold text-white mb-6">
                    {editingJob ? 'Edit Job Listing' : 'Post New Job'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white mb-2">Job Title *</label>
                      <input
                        type="text"
                        value={jobForm.title}
                        onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                        placeholder="e.g., Senior Software Engineer"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Job Description *</label>
                      <textarea
                        value={jobForm.description}
                        onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                        rows={6}
                        placeholder="Describe the role, responsibilities, and requirements..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white mb-2">Employment Type</label>
                        <select
                          value={jobForm.employment_type}
                          onChange={(e) => setJobForm({ ...jobForm, employment_type: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                        >
                          <option value="full-time">Full-time</option>
                          <option value="part-time">Part-time</option>
                          <option value="contract">Contract</option>
                          <option value="temporary">Temporary</option>
                          <option value="internship">Internship</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-white mb-2">Remote Option</label>
                        <select
                          value={jobForm.remote_option}
                          onChange={(e) => setJobForm({ ...jobForm, remote_option: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                        >
                          <option value="on-site">On-site</option>
                          <option value="remote">Remote</option>
                          <option value="hybrid">Hybrid</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white mb-2">Location</label>
                      <input
                        type="text"
                        value={jobForm.location}
                        onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                        placeholder="e.g., London, UK"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white mb-2">Salary Min (£)</label>
                        <input
                          type="number"
                          value={jobForm.salary_min}
                          onChange={(e) => setJobForm({ ...jobForm, salary_min: parseFloat(e.target.value) })}
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-white mb-2">Salary Max (£)</label>
                        <input
                          type="number"
                          value={jobForm.salary_max}
                          onChange={(e) => setJobForm({ ...jobForm, salary_max: parseFloat(e.target.value) })}
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                          min="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white mb-2">Salary Period</label>
                      <select
                        value={jobForm.salary_period}
                        onChange={(e) => setJobForm({ ...jobForm, salary_period: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                      >
                        <option value="hourly">Hourly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={handleSaveJob}
                      className="flex-1 py-3 rounded-lg font-semibold"
                      style={{ backgroundColor: '#dbf72c', color: '#0c0f17' }}
                    >
                      {editingJob ? 'Update Job Listing' : 'Post Job'}
                    </button>
                    <button
                      onClick={() => {
                        setShowJobForm(false);
                        setEditingJob(null);
                        resetJobForm();
                      }}
                      className="flex-1 py-3 rounded-lg font-semibold bg-gray-700 text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Job Listings */}
            {jobListings.length === 0 ? (
              <div className="bg-gray-800 rounded-xl p-12 text-center">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-bold text-white mb-2">No job listings yet</h3>
                <p className="text-gray-400 mb-6">Post your first job to start receiving applications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobListings.map(job => (
                  <div
                    key={job.id}
                    className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2">{job.title}</h3>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Briefcase size={16} />
                            {job.employment_type}
                          </span>
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={16} />
                              {job.location}
                            </span>
                          )}
                          {job.remote_option && (
                            <span className="capitalize">{job.remote_option}</span>
                          )}
                          {(job.salary_min > 0 || job.salary_max > 0) && (
                            <span className="flex items-center gap-1">
                              <DollarSign size={16} />
                              £{job.salary_min > 0 ? job.salary_min.toLocaleString() : ''}
                              {job.salary_max > 0 && ` - £${job.salary_max.toLocaleString()}`}
                              {job.salary_period && ` / ${job.salary_period}`}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewApplications(job)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="View Applications"
                        >
                          <Users size={18} className="text-gray-400" />
                          <span className="ml-1 text-sm text-gray-400">{job.applications_count}</span>
                        </button>
                        <button
                          onClick={() => handleEditJob(job)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit size={18} className="text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} className="text-red-400" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-300 mb-4 line-clamp-2">{job.description}</p>

                    <div className="flex items-center justify-between">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: job.status === 'active' ? '#10b981' : '#6b7280',
                          color: 'white'
                        }}
                      >
                        {job.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        Posted {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div>
            {!selectedJob ? (
              <div className="bg-gray-800 rounded-xl p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-bold text-white mb-2">Select a job listing</h3>
                <p className="text-gray-400 mb-6">Go to Job Listings tab and click on a job to view its applications</p>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Applications for: {selectedJob.title}
                  </h2>
                  <p className="text-gray-400">{applications.length} total applications</p>
                </div>

                {applications.length === 0 ? (
                  <div className="bg-gray-800 rounded-xl p-12 text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-bold text-white mb-2">No applications yet</h3>
                    <p className="text-gray-400">Applications will appear here when candidates apply</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map(app => (
                      <div
                        key={app.id}
                        className="bg-gray-800 rounded-xl p-6 border border-gray-700"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">{app.applicant_name}</h3>
                            <p className="text-gray-400">{app.applicant_email}</p>
                            {app.applicant_phone && (
                              <p className="text-gray-400">{app.applicant_phone}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {app.resume_url && (
                              <a
                                href={app.resume_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                              >
                                View Resume
                              </a>
                            )}
                          </div>
                        </div>

                        {app.cover_letter && (
                          <div className="mb-4">
                            <h4 className="text-white font-semibold mb-2">Cover Letter:</h4>
                            <p className="text-gray-300 text-sm">{app.cover_letter}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <select
                              value={app.status}
                              onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value)}
                              className="px-4 py-2 rounded-lg text-white"
                              style={{ backgroundColor: getStatusColor(app.status) }}
                            >
                              <option value="new">New</option>
                              <option value="reviewing">Reviewing</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="interviewed">Interviewed</option>
                              <option value="offered">Offered</option>
                              <option value="rejected">Rejected</option>
                              <option value="withdrawn">Withdrawn</option>
                            </select>
                          </div>
                          <span className="text-sm text-gray-500">
                            Applied {new Date(app.applied_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
