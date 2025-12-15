'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Clock, DollarSign, Users, Calendar, Loader2 } from 'lucide-react';

interface Service {
  id: number;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  currency: string;
  buffer_time_minutes: number;
  is_active: boolean;
  color: string;
}

interface Staff {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar_url: string;
  is_active: boolean;
  services: any[];
}

export default function BookingsManagementPage() {
  const router = useRouter();
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'staff' | 'bookings'>('services');
  
  // Service form state
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    duration_minutes: 60,
    price: 0,
    currency: 'GBP',
    buffer_time_minutes: 0,
    color: '#3b82f6'
  });

  // Staff form state
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    phone: '',
    avatar_url: '',
    serviceIds: [] as number[]
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

      // Check if subscribed to bookings module
      const subsRes = await fetch(`/api/business-subscriptions?businessId=${bId}`);
      const subscriptions = await subsRes.json();
      
      const hasBookings = subscriptions.some((sub: any) => 
        sub.module_slug === 'bookings-appointments' && 
        (sub.status === 'active' || sub.status === 'trial')
      );

      if (!hasBookings) {
        router.push('/dashboard/modules');
        return;
      }

      await loadServices(bId);
      await loadStaff(bId);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async (bId: number) => {
    const res = await fetch(`/api/booking-services?businessId=${bId}`);
    const data = await res.json();
    setServices(data);
  };

  const loadStaff = async (bId: number) => {
    const res = await fetch(`/api/booking-staff?businessId=${bId}`);
    const data = await res.json();
    setStaff(data);
  };

  const handleSaveService = async () => {
    try {
      const url = editingService ? '/api/booking-services' : '/api/booking-services';
      const method = editingService ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...serviceForm,
          businessId,
          id: editingService?.id,
          durationMinutes: serviceForm.duration_minutes,
          bufferTimeMinutes: serviceForm.buffer_time_minutes
        })
      });

      if (response.ok) {
        await loadServices(businessId!);
        setShowServiceForm(false);
        setEditingService(null);
        resetServiceForm();
      }
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Failed to save service');
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      await fetch(`/api/booking-services?id=${id}`, { method: 'DELETE' });
      await loadServices(businessId!);
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      description: service.description,
      duration_minutes: service.duration_minutes,
      price: service.price,
      currency: service.currency,
      buffer_time_minutes: service.buffer_time_minutes,
      color: service.color
    });
    setShowServiceForm(true);
  };

  const resetServiceForm = () => {
    setServiceForm({
      name: '',
      description: '',
      duration_minutes: 60,
      price: 0,
      currency: 'GBP',
      buffer_time_minutes: 0,
      color: '#3b82f6'
    });
  };

  const handleSaveStaff = async () => {
    try {
      const url = '/api/booking-staff';
      const method = editingStaff ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...staffForm,
          businessId,
          id: editingStaff?.id,
          avatarUrl: staffForm.avatar_url
        })
      });

      if (response.ok) {
        await loadStaff(businessId!);
        setShowStaffForm(false);
        setEditingStaff(null);
        resetStaffForm();
      }
    } catch (error) {
      console.error('Error saving staff:', error);
      alert('Failed to save staff member');
    }
  };

  const handleDeleteStaff = async (id: number) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    try {
      await fetch(`/api/booking-staff?id=${id}`, { method: 'DELETE' });
      await loadStaff(businessId!);
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  const handleEditStaff = (member: Staff) => {
    setEditingStaff(member);
    setStaffForm({
      name: member.name,
      email: member.email,
      phone: member.phone,
      avatar_url: member.avatar_url,
      serviceIds: member.services.map(s => s.id)
    });
    setShowStaffForm(true);
  };

  const resetStaffForm = () => {
    setStaffForm({
      name: '',
      email: '',
      phone: '',
      avatar_url: '',
      serviceIds: []
    });
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
          <h1 className="text-4xl font-bold text-white mb-2">Bookings & Appointments</h1>
          <p className="text-gray-400 text-lg">
            Manage your services, staff, and bookings
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'services'
                ? 'text-white border-b-2'
                : 'text-gray-400 hover:text-white'
            }`}
            style={{ borderColor: activeTab === 'services' ? '#dbf72c' : 'transparent' }}
          >
            Services
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'staff'
                ? 'text-white border-b-2'
                : 'text-gray-400 hover:text-white'
            }`}
            style={{ borderColor: activeTab === 'staff' ? '#dbf72c' : 'transparent' }}
          >
            Staff
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'bookings'
                ? 'text-white border-b-2'
                : 'text-gray-400 hover:text-white'
            }`}
            style={{ borderColor: activeTab === 'bookings' ? '#dbf72c' : 'transparent' }}
          >
            Bookings
          </button>
        </div>

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Services</h2>
              <button
                onClick={() => {
                  resetServiceForm();
                  setEditingService(null);
                  setShowServiceForm(true);
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold"
                style={{ backgroundColor: '#dbf72c', color: '#0c0f17' }}
              >
                <Plus size={20} />
                Add Service
              </button>
            </div>

            {/* Service Form Modal */}
            {showServiceForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <h3 className="text-2xl font-bold text-white mb-6">
                    {editingService ? 'Edit Service' : 'Add New Service'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white mb-2">Service Name *</label>
                      <input
                        type="text"
                        value={serviceForm.name}
                        onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                        placeholder="e.g., Haircut, Consultation, Massage"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Description</label>
                      <textarea
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                        rows={3}
                        placeholder="Describe your service..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white mb-2">Duration (minutes) *</label>
                        <input
                          type="number"
                          value={serviceForm.duration_minutes}
                          onChange={(e) => setServiceForm({ ...serviceForm, duration_minutes: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                          min="15"
                          step="15"
                        />
                      </div>

                      <div>
                        <label className="block text-white mb-2">Buffer Time (minutes)</label>
                        <input
                          type="number"
                          value={serviceForm.buffer_time_minutes}
                          onChange={(e) => setServiceForm({ ...serviceForm, buffer_time_minutes: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                          min="0"
                          step="5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white mb-2">Price</label>
                        <input
                          type="number"
                          value={serviceForm.price}
                          onChange={(e) => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) })}
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-white mb-2">Color</label>
                        <input
                          type="color"
                          value={serviceForm.color}
                          onChange={(e) => setServiceForm({ ...serviceForm, color: e.target.value })}
                          className="w-full h-12 bg-gray-700 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={handleSaveService}
                      className="flex-1 py-3 rounded-lg font-semibold"
                      style={{ backgroundColor: '#dbf72c', color: '#0c0f17' }}
                    >
                      {editingService ? 'Update Service' : 'Create Service'}
                    </button>
                    <button
                      onClick={() => {
                        setShowServiceForm(false);
                        setEditingService(null);
                        resetServiceForm();
                      }}
                      className="flex-1 py-3 rounded-lg font-semibold bg-gray-700 text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Services List */}
            {services.length === 0 ? (
              <div className="bg-gray-800 rounded-xl p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-bold text-white mb-2">No services yet</h3>
                <p className="text-gray-400 mb-6">Create your first bookable service to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                  <div
                    key={service.id}
                    className="bg-gray-800 rounded-xl p-6 border-l-4"
                    style={{ borderLeftColor: service.color }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white">{service.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditService(service)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit size={18} className="text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} className="text-red-400" />
                        </button>
                      </div>
                    </div>

                    {service.description && (
                      <p className="text-gray-400 text-sm mb-4">{service.description}</p>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Clock size={16} />
                        <span>{service.duration_minutes} minutes</span>
                      </div>
                      {service.price > 0 && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <DollarSign size={16} />
                          <span>£{service.price.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        service.is_active 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Staff Members</h2>
              <button
                onClick={() => {
                  resetStaffForm();
                  setEditingStaff(null);
                  setShowStaffForm(true);
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold"
                style={{ backgroundColor: '#dbf72c', color: '#0c0f17' }}
              >
                <Plus size={20} />
                Add Staff Member
              </button>
            </div>

            {/* Staff Form Modal */}
            {showStaffForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <h3 className="text-2xl font-bold text-white mb-6">
                    {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white mb-2">Name *</label>
                      <input
                        type="text"
                        value={staffForm.name}
                        onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                        placeholder="Staff member name"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Email</label>
                      <input
                        type="email"
                        value={staffForm.email}
                        onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                        placeholder="email@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Phone</label>
                      <input
                        type="tel"
                        value={staffForm.phone}
                        onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                        placeholder="+44 1234 567890"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Services</label>
                      <div className="space-y-2 max-h-48 overflow-y-auto bg-gray-700 rounded-lg p-4">
                        {services.map(service => (
                          <label key={service.id} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={staffForm.serviceIds.includes(service.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setStaffForm({
                                    ...staffForm,
                                    serviceIds: [...staffForm.serviceIds, service.id]
                                  });
                                } else {
                                  setStaffForm({
                                    ...staffForm,
                                    serviceIds: staffForm.serviceIds.filter(id => id !== service.id)
                                  });
                                }
                              }}
                              className="w-5 h-5"
                            />
                            <span className="text-white">{service.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={handleSaveStaff}
                      className="flex-1 py-3 rounded-lg font-semibold"
                      style={{ backgroundColor: '#dbf72c', color: '#0c0f17' }}
                    >
                      {editingStaff ? 'Update Staff Member' : 'Add Staff Member'}
                    </button>
                    <button
                      onClick={() => {
                        setShowStaffForm(false);
                        setEditingStaff(null);
                        resetStaffForm();
                      }}
                      className="flex-1 py-3 rounded-lg font-semibold bg-gray-700 text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Staff List */}
            {staff.length === 0 ? (
              <div className="bg-gray-800 rounded-xl p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-bold text-white mb-2">No staff members yet</h3>
                <p className="text-gray-400 mb-6">Add staff members who can provide your services</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.map(member => (
                  <div key={member.id} className="bg-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white">{member.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditStaff(member)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit size={18} className="text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(member.id)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} className="text-red-400" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-400 mb-4">
                      {member.email && <p>{member.email}</p>}
                      {member.phone && <p>{member.phone}</p>}
                    </div>

                    <div>
                      <p className="text-gray-500 text-xs mb-2">Services:</p>
                      <div className="flex flex-wrap gap-2">
                        {member.services.length > 0 ? (
                          member.services.map(service => (
                            <span
                              key={service.id}
                              className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                            >
                              {service.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-xs">No services assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-bold text-white mb-2">Booking Calendar Coming Soon</h3>
            <p className="text-gray-400">
              The booking calendar and management interface will be available in the next update
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
