'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Clock, DollarSign, Users, Calendar, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

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

interface Booking {
  id: number;
  business_id: number;
  service_id: number;
  service_name: string;
  duration_minutes: number;
  service_price: number;
  staff_id: number;
  staff_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  start_datetime: string;
  end_datetime: string;
  status: string;
  notes: string;
  confirmation_code: string;
  created_at: string;
}

export default function BookingsManagementPage() {
  const router = useRouter();
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
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

  // Booking form state
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [bookingForm, setBookingForm] = useState({
    serviceId: 0,
    staffId: 0,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    date: '',
    time: '',
    notes: ''
  });

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'day'>('month');

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
      await loadBookings(bId);

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

  const loadBookings = async (bId: number) => {
    const res = await fetch(`/api/bookings?businessId=${bId}`);
    const data = await res.json();
    setBookings(data);
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

  const handleSaveBooking = async () => {
    try {
      if (!bookingForm.serviceId || !bookingForm.customerName || !bookingForm.customerEmail || !bookingForm.date || !bookingForm.time) {
        alert('Please fill in all required fields');
        return;
      }

      const selectedService = services.find(s => s.id === bookingForm.serviceId);
      if (!selectedService) return;

      const startDatetime = `${bookingForm.date}T${bookingForm.time}:00`;
      const startDate = new Date(startDatetime);
      const endDate = new Date(startDate.getTime() + selectedService.duration_minutes * 60000);
      const endDatetime = endDate.toISOString().slice(0, 19).replace('T', ' ');

      const url = '/api/bookings';
      const method = editingBooking ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingForm,
          businessId,
          id: editingBooking?.id,
          startDatetime: startDatetime.replace('T', ' '),
          endDatetime,
          staffId: bookingForm.staffId || null
        })
      });

      if (response.ok) {
        await loadBookings(businessId!);
        setShowBookingForm(false);
        setEditingBooking(null);
        resetBookingForm();
        alert('Booking saved successfully!');
      }
    } catch (error) {
      console.error('Error saving booking:', error);
      alert('Failed to save booking');
    }
  };

  const handleDeleteBooking = async (id: number) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
      await fetch(`/api/bookings?id=${id}`, { method: 'DELETE' });
      await loadBookings(businessId!);
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const handleUpdateBookingStatus = async (id: number, status: string) => {
    try {
      await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      await loadBookings(businessId!);
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const resetBookingForm = () => {
    setBookingForm({
      serviceId: 0,
      staffId: 0,
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      date: '',
      time: '',
      notes: ''
    });
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': '#f59e0b',
      'confirmed': '#10b981',
      'cancelled': '#ef4444',
      'completed': '#6b7280',
      'no_show': '#dc2626'
    };
    return colors[status] || '#6b7280';
  };

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.start_datetime).toISOString().split('T')[0];
      return bookingDate === dateStr;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
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
                      {service.price != null && service.price > 0 && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <DollarSign size={16} />
                          <span>£{Number(service.price).toFixed(2)}</span>
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
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Bookings Calendar</h2>
              <div className="flex gap-3">
                <div className="flex gap-2 bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setCalendarView('month')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      calendarView === 'month' ? 'text-black' : 'text-white'
                    }`}
                    style={{ backgroundColor: calendarView === 'month' ? '#dbf72c' : 'transparent' }}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setCalendarView('day')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      calendarView === 'day' ? 'text-black' : 'text-white'
                    }`}
                    style={{ backgroundColor: calendarView === 'day' ? '#dbf72c' : 'transparent' }}
                  >
                    Day
                  </button>
                </div>
                <button
                  onClick={() => {
                    resetBookingForm();
                    setEditingBooking(null);
                    setShowBookingForm(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold"
                  style={{ backgroundColor: '#dbf72c', color: '#0c0f17' }}
                >
                  <Plus size={20} />
                  Create Booking
                </button>
              </div>
            </div>

            {/* Calendar View */}
            {calendarView === 'month' && (
              <div className="bg-gray-800 rounded-xl p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={24} className="text-white" />
                  </button>
                  <h3 className="text-2xl font-bold text-white">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronRight size={24} className="text-white" />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Day Headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center py-2 text-gray-400 font-semibold text-sm">
                      {day}
                    </div>
                  ))}

                  {/* Calendar Days */}
                  {(() => {
                    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
                    const days = [];

                    // Empty cells for days before month starts
                    for (let i = 0; i < startingDayOfWeek; i++) {
                      days.push(
                        <div key={`empty-${i}`} className="aspect-square p-2 bg-gray-900 rounded-lg"></div>
                      );
                    }

                    // Days of the month
                    for (let day = 1; day <= daysInMonth; day++) {
                      const date = new Date(year, month, day);
                      const dayBookings = getBookingsForDate(date);
                      const isCurrentDay = isToday(date);
                      const isSelected = isSameDay(date, selectedDate);

                      days.push(
                        <div
                          key={day}
                          onClick={() => {
                            setSelectedDate(date);
                            setCalendarView('day');
                          }}
                          className={`aspect-square p-2 rounded-lg cursor-pointer transition-all hover:bg-gray-700 ${
                            isCurrentDay ? 'ring-2 ring-blue-500' : ''
                          } ${isSelected ? 'bg-gray-700' : 'bg-gray-900'}`}
                        >
                          <div className="h-full flex flex-col">
                            <span className={`text-sm font-semibold mb-1 ${
                              isCurrentDay ? 'text-blue-400' : 'text-white'
                            }`}>
                              {day}
                            </span>
                            {dayBookings.length > 0 && (
                              <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                                {dayBookings.slice(0, 2).map(booking => (
                                  <div
                                    key={booking.id}
                                    className="text-xs px-1 py-0.5 rounded truncate"
                                    style={{ backgroundColor: getStatusColor(booking.status) }}
                                  >
                                    <span className="text-white font-medium">
                                      {new Date(booking.start_datetime).toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  </div>
                                ))}
                                {dayBookings.length > 2 && (
                                  <div className="text-xs text-gray-400">
                                    +{dayBookings.length - 2} more
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return days;
                  })()}
                </div>

                {/* Legend */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <p className="text-gray-400 text-sm mb-3">Status Legend:</p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                      <span className="text-gray-300 text-sm">Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
                      <span className="text-gray-300 text-sm">Confirmed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6b7280' }}></div>
                      <span className="text-gray-300 text-sm">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                      <span className="text-gray-300 text-sm">Cancelled</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Day View */}
            {calendarView === 'day' && (
              <div className="bg-gray-800 rounded-xl p-6">
                {/* Day Header */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(newDate.getDate() - 1);
                      setSelectedDate(newDate);
                    }}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={24} className="text-white" />
                  </button>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white">
                      {selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric' 
                      })}
                    </h3>
                    <p className="text-gray-400 mt-1">
                      {getBookingsForDate(selectedDate).length} booking{getBookingsForDate(selectedDate).length !== 1 ? 's' : ''} scheduled
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(newDate.getDate() + 1);
                      setSelectedDate(newDate);
                    }}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronRight size={24} className="text-white" />
                  </button>
                </div>

                {/* Day Schedule */}
                <div className="space-y-3">
                  {getBookingsForDate(selectedDate).length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400">No bookings scheduled for this day</p>
                    </div>
                  ) : (
                    getBookingsForDate(selectedDate)
                      .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
                      .map(booking => {
                        const startTime = new Date(booking.start_datetime);
                        const endTime = new Date(booking.end_datetime);
                        
                        return (
                          <div
                            key={booking.id}
                            className="bg-gray-900 rounded-lg p-4 border-l-4 hover:bg-gray-850 transition-all"
                            style={{ borderLeftColor: getStatusColor(booking.status) }}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-lg font-bold text-white">
                                    {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {' - '}
                                    {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <span
                                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                                    style={{ backgroundColor: getStatusColor(booking.status) }}
                                  >
                                    {booking.status}
                                  </span>
                                </div>
                                <h4 className="text-xl font-bold text-white mb-1">{booking.service_name}</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {booking.duration_minutes} min
                                  </span>
                                  {booking.staff_name && (
                                    <span className="flex items-center gap-1">
                                      <Users size={14} />
                                      {booking.staff_name}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteBooking(booking.id)}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                              >
                                <Trash2 size={18} className="text-red-400" />
                              </button>
                            </div>

                            <div className="border-t border-gray-800 pt-3 mt-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-gray-500 text-xs mb-1">Customer</p>
                                  <p className="text-white font-semibold">{booking.customer_name}</p>
                                  <p className="text-gray-400 text-sm">{booking.customer_email}</p>
                                  {booking.customer_phone && (
                                    <p className="text-gray-400 text-sm">{booking.customer_phone}</p>
                                  )}
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs mb-1">Confirmation</p>
                                  <p className="text-white font-mono font-semibold">{booking.confirmation_code}</p>
                                </div>
                              </div>

                              {booking.notes && (
                                <div className="mt-3">
                                  <p className="text-gray-500 text-xs mb-1">Notes</p>
                                  <p className="text-gray-300 text-sm">{booking.notes}</p>
                                </div>
                              )}

                              <div className="mt-3">
                                <select
                                  value={booking.status}
                                  onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                                  className="px-4 py-2 rounded-lg text-white text-sm"
                                  style={{ backgroundColor: getStatusColor(booking.status) }}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                  <option value="no_show">No Show</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            )}

            {/* Booking Form Modal */}
            {showBookingForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <h3 className="text-2xl font-bold text-white mb-6">
                    {editingBooking ? 'Edit Booking' : 'Create New Booking'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white mb-2">Service *</label>
                      <select
                        value={bookingForm.serviceId}
                        onChange={(e) => setBookingForm({ ...bookingForm, serviceId: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                      >
                        <option value={0}>Select a service</option>
                        {services.filter(s => s.is_active).map(service => (
                          <option key={service.id} value={service.id}>
                            {service.name} ({service.duration_minutes} min)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-white mb-2">Staff Member (Optional)</label>
                      <select
                        value={bookingForm.staffId}
                        onChange={(e) => setBookingForm({ ...bookingForm, staffId: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                      >
                        <option value={0}>Any available staff</option>
                        {staff.filter(s => s.is_active).map(member => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white mb-2">Date *</label>
                        <input
                          type="date"
                          value={bookingForm.date}
                          onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <div>
                        <label className="block text-white mb-2">Time *</label>
                        <input
                          type="time"
                          value={bookingForm.time}
                          onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white mb-2">Customer Name *</label>
                      <input
                        type="text"
                        value={bookingForm.customerName}
                        onChange={(e) => setBookingForm({ ...bookingForm, customerName: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Customer Email *</label>
                      <input
                        type="email"
                        value={bookingForm.customerEmail}
                        onChange={(e) => setBookingForm({ ...bookingForm, customerEmail: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Customer Phone</label>
                      <input
                        type="tel"
                        value={bookingForm.customerPhone}
                        onChange={(e) => setBookingForm({ ...bookingForm, customerPhone: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                        placeholder="+44 1234 567890"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Notes</label>
                      <textarea
                        value={bookingForm.notes}
                        onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg"
                        rows={3}
                        placeholder="Any special requests or notes..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={handleSaveBooking}
                      className="flex-1 py-3 rounded-lg font-semibold"
                      style={{ backgroundColor: '#dbf72c', color: '#0c0f17' }}
                    >
                      {editingBooking ? 'Update Booking' : 'Create Booking'}
                    </button>
                    <button
                      onClick={() => {
                        setShowBookingForm(false);
                        setEditingBooking(null);
                        resetBookingForm();
                      }}
                      className="flex-1 py-3 rounded-lg font-semibold bg-gray-700 text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bookings List */}
            {bookings.length === 0 ? (
              <div className="bg-gray-800 rounded-xl p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-bold text-white mb-2">No bookings yet</h3>
                <p className="text-gray-400 mb-6">Create your first booking to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(booking => {
                  const bookingDate = new Date(booking.start_datetime);
                  const isUpcoming = bookingDate > new Date();
                  
                  return (
                    <div
                      key={booking.id}
                      className="bg-gray-800 rounded-xl p-6 border border-gray-700"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white">{booking.service_name}</h3>
                            <span
                              className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                              style={{ backgroundColor: getStatusColor(booking.status) }}
                            >
                              {booking.status}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-400">
                            <p className="flex items-center gap-2">
                              <Calendar size={16} />
                              {bookingDate.toLocaleDateString()} at {bookingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="flex items-center gap-2">
                              <Clock size={16} />
                              {booking.duration_minutes} minutes
                            </p>
                            {booking.staff_name && (
                              <p className="flex items-center gap-2">
                                <Users size={16} />
                                {booking.staff_name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} className="text-red-400" />
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-gray-700 pt-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Customer</p>
                            <p className="text-white font-semibold">{booking.customer_name}</p>
                            <p className="text-gray-400 text-sm">{booking.customer_email}</p>
                            {booking.customer_phone && (
                              <p className="text-gray-400 text-sm">{booking.customer_phone}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Confirmation Code</p>
                            <p className="text-white font-mono font-semibold">{booking.confirmation_code}</p>
                          </div>
                        </div>

                        {booking.notes && (
                          <div className="mb-4">
                            <p className="text-gray-500 text-xs mb-1">Notes</p>
                            <p className="text-gray-300 text-sm">{booking.notes}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <select
                            value={booking.status}
                            onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                            className="px-4 py-2 rounded-lg text-white text-sm"
                            style={{ backgroundColor: getStatusColor(booking.status) }}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="no_show">No Show</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
