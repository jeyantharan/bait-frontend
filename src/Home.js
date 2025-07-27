import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Keep default calendar styles for base, then override

function Home({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [apartments, setApartments] = useState([]);
  const [total, setTotal] = useState(0);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 5;
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingForm, setBookingForm] = useState({
    clientName: '',
    phone: '',
    email: '',
    bookingDate: '',
    checkIn: '',
    checkOut: '',
    price: '',
    advance: '',
    paymentMethod: '',
    paymentDate: '',
    specialNote: '',
    guests: ''
  });
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [editingBooking, setEditingBooking] = useState(null);
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingSearch, setBookingSearch] = useState('');
  const [hoveredDate, setHoveredDate] = useState(null);
  const [hoveredBooking, setHoveredBooking] = useState(null);
  const BOOKINGS_PER_PAGE = 8;
  const [selectedDateBookings, setSelectedDateBookings] = useState([]);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [showRangeWarning, setShowRangeWarning] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [paymentsBooking, setPaymentsBooking] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [newPayment, setNewPayment] = useState({ date: '', amount: '', method: '', note: '' });
  const [paymentModalError, setPaymentModalError] = useState('');
  const [paymentModalSuccess, setPaymentModalSuccess] = useState('');
  const [isEditingPayment, setIsEditingPayment] = useState(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');
  const [showEditApartmentModal, setShowEditApartmentModal] = useState(false);
  const [editingApartment, setEditingApartment] = useState(null);
  const [editApartmentName, setEditApartmentName] = useState('');
  const [editApartmentError, setEditApartmentError] = useState('');
  const [editApartmentSuccess, setEditApartmentSuccess] = useState('');
  const [showDeleteBookingModal, setShowDeleteBookingModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [deleteBookingError, setDeleteBookingError] = useState('');
  const [deleteBookingSuccess, setDeleteBookingSuccess] = useState('');
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);

  // Helper function to format date as dd-mm-yyyy
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const fetchApartments = async (pageNum = 1, searchTerm = '') => {
    try {
      const res = await axios.get('https://backend-ruby-eight-64.vercel.app/api/apartments', {
        params: { page: pageNum, limit, search: searchTerm }
      });
      setApartments(res.data.apartments || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError('Failed to fetch apartments');
    }
  };

  useEffect(() => {
    fetchApartments(page, search);
    // eslint-disable-next-line
  }, [page, search]);

  useEffect(() => {
    if (selectedApartment && showModal) {
      axios.get('https://backend-ruby-eight-64.vercel.app/api/bookings', {
        params: { apartmentId: selectedApartment._id }
      })
        .then(res => {
          setBookings(res.data);
        })
        .catch(() => setBookings([]));
    }
  }, [selectedApartment, showModal]);

  // Close calendars when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCheckInCalendar || showCheckOutCalendar) {
        const calendarContainers = document.querySelectorAll('.calendar-popup');
        let clickedInside = false;
        calendarContainers.forEach(container => {
          if (container.contains(event.target)) {
            clickedInside = true;
          }
        });
        if (!clickedInside) {
          setShowCheckInCalendar(false);
          setShowCheckOutCalendar(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCheckInCalendar, showCheckOutCalendar]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name) {
      setError('Name is required');
      return;
    }
    try {
      await axios.post('https://backend-ruby-eight-64.vercel.app/api/apartments', { name });
      setSuccess('Apartment created!');
      setName('');
      setPage(1);
      fetchApartments(1, search);
    } catch (err) {
      setError('Failed to create apartment');
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  // Filter and paginate bookings
  const filteredBookings = bookings
    .filter(b => b.clientName.toLowerCase().includes(bookingSearch.toLowerCase()))
    .sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn)); // Sort by check-in date
  const totalBookingPages = Math.ceil(filteredBookings.length / BOOKINGS_PER_PAGE);
  const paginatedBookings = filteredBookings.slice((bookingPage - 1) * BOOKINGS_PER_PAGE, bookingPage * BOOKINGS_PER_PAGE);

  const printBooking = (booking) => {
    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow.document.write('<html><head><title>Booking Details</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; }
      h2 { color: #000000; margin-bottom: 15px; }
      strong { color: #000000; }
      div { margin-bottom: 5px; }
    `);
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(`<h2>Booking Details</h2>`);
    printWindow.document.write(`<div><strong>Client Name:</strong> ${booking.clientName}</div>`);
    printWindow.document.write(`<div><strong>Phone:</strong> ${booking.phone || ''}</div>`);
    printWindow.document.write(`<div><strong>Email:</strong> ${booking.email || ''}</div>`);
    printWindow.document.write(`<div><strong>Booking Date:</strong> ${booking.bookingDate ? formatDate(booking.bookingDate) : ''}</div>`);
    printWindow.document.write(`<div><strong>Check In:</strong> ${formatDate(booking.checkIn)}</div>`);
    printWindow.document.write(`<div><strong>Check Out:</strong> ${formatDate(booking.checkOut)}</div>`);
    printWindow.document.write(`<div><strong>Guests:</strong> ${booking.guests}</div>`);
    printWindow.document.write(`<div><strong>Price:</strong> $${booking.price}</div>`);
    const totalPaid = booking.payments && booking.payments.length > 0 ? booking.payments.reduce((sum, p) => sum + Number(p.amount), 0) : 0;
    printWindow.document.write(`<div><strong>Paid:</strong> $${totalPaid}</div>`);
    printWindow.document.write(`<div><strong>Due:</strong> $${booking.paid ? 0 : (booking.price - totalPaid)}</div>`);
    printWindow.document.write(`<div><strong>Status:</strong> ${((Math.abs(Number(totalPaid) - Number(booking.price)) < 0.01) || (Number(totalPaid) > Number(booking.price))) ? 'Paid' : 'Not Paid'}</div>`);
    printWindow.document.write(`<div><strong>Special Note:</strong> ${booking.specialNote || 'N/A'}</div>`);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Helper to get all dates in a range (excluding check-out date)
  function getDatesInRange(start, end) {
    const date = new Date(start);
    const dates = [];
    while (date < end) { // Changed from <= to < to exclude check-out date
      dates.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return dates;
  }

  // Compute booked/free dates in selected range
  let bookedDatesInRange = [];
  let freeDatesInRange = [];
  let bookedDateInfo = {};
  let hasBookedDates = false;
  if (bookingForm.checkIn && bookingForm.checkOut) {
    const checkInDate = new Date(bookingForm.checkIn);
    const checkOutDate = new Date(bookingForm.checkOut);
    
    // Validate that dates are valid before processing
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      console.log('Invalid dates detected:', { checkIn: bookingForm.checkIn, checkOut: bookingForm.checkOut });
      return;
    }
    
    const allDates = getDatesInRange(checkInDate, checkOutDate);
    
    // Debug: Show what dates are being considered for the new booking
    console.log('New booking dates:', {
      checkIn: formatDate(bookingForm.checkIn),
      checkOut: formatDate(bookingForm.checkOut),
      allDates: allDates.map(d => formatDate(d.toISOString()))
    });
    
    bookings.forEach(b => {
      // Skip the current booking being edited when checking for conflicts
      if (editingBooking && b._id === editingBooking) {
        return;
      }
      const bStart = new Date(b.checkIn);
      const bEnd = new Date(b.checkOut);
      let d = new Date(bStart);
      while (d < bEnd) { // Changed from <= to < to exclude check-out date
        const key = d.toISOString().slice(0,10);
        bookedDateInfo[key] = b.clientName;
        d.setDate(d.getDate() + 1);
      }
    });
    
    // Debug: Show what dates are already booked
    console.log('Already booked dates:', Object.keys(bookedDateInfo).map(key => formatDate(key)));
    
    bookedDatesInRange = allDates.filter(d => bookedDateInfo[d.toISOString().slice(0,10)]);
    freeDatesInRange = allDates.filter(d => !bookedDateInfo[d.toISOString().slice(0,10)]);
    hasBookedDates = bookedDatesInRange.length > 0;
    
    // Debug: Show conflict results
    console.log('Conflict check:', {
      hasBookedDates,
      bookedDatesInRange: bookedDatesInRange.map(d => formatDate(d.toISOString())),
      freeDatesInRange: freeDatesInRange.map(d => formatDate(d.toISOString()))
    });
  }

  // Add a helper to calculate totalPaid for a booking
  function getTotalPaid(booking) {
    if (booking.payments && booking.payments.length > 0) {
      return booking.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    }
    return 0;
  }

  // Add a helper for due amount
  function getDue(booking) {
    if (booking.paid) return 0;
    return Number(booking.price) - getTotalPaid(booking);
  }

  // Helper to check if booking is fully paid
  function isBookingPaid(booking) {
    const totalPaid = getTotalPaid(booking);
    const price = Number(booking.price);
    return Math.abs(Number(totalPaid) - price) < 0.01 || Number(totalPaid) > price;
  }

  const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="currentColor">
      <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.37L4 29l7.824-2.05A12.94 12.94 0 0016 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22.917c-2.07 0-4.09-.54-5.84-1.56l-.417-.25-4.65 1.22 1.24-4.52-.27-.44A9.93 9.93 0 016.083 15c0-5.477 4.44-9.917 9.917-9.917S25.917 9.523 25.917 15 21.477 25.917 16 25.917zm5.13-7.13c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.32.42-.48.14-.16.18-.28.28-.46.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.34-.01-.52-.01-.18 0-.48.07-.73.34-.25.27-.97.95-.97 2.3 0 1.35.99 2.65 1.13 2.83.14.18 1.95 2.98 4.73 4.06.66.28 1.18.45 1.58.58.66.21 1.26.18 1.73.11.53-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z"/>
    </svg>
  );

  const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
    </svg>
  );

  // Compute displayPayments for payment portal
  const displayPayments = (paymentHistory && paymentHistory.length > 0)
    ? paymentHistory
    : [];

  return (
    <div className="min-h-screen bg-white text-black py-8">
      <div className="container px-4">
        {/* Header */}
        <div className="bg-black text-white p-8 rounded-xl mb-8 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-4xl font-extrabold mb-2">🏢 Apartment Manager</h1>
              <p className="text-gray-400 text-lg">Welcome Home! You are logged in.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowChangePasswordModal(true)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-all duration-300 transform hover:-translate-y-px shadow-md"
              >
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-all duration-300 transform hover:-translate-y-px shadow-md"
              >
                Logout
              </button>
            </div>
          </div>
          <form onSubmit={handleCreate} className="mt-6 flex flex-col sm:flex-row items-center gap-4">
            <input
              type="text"
              placeholder="New Apartment Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 w-full sm:w-auto border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-black bg-white"
            />
            <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 transform hover:-translate-y-px shadow-md w-full sm:w-auto">
              Create Apartment
            </button>
          </form>
          {error && <div className="message error mt-4">{error}</div>}
          {success && <div className="message success mt-4">{success}</div>}
        </div>

        {/* Apartment List Section */}
        <div className="card">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold text-black flex items-center gap-2">Apartment List <span className="text-base text-gray-500">({total})</span></h2>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate('/clients')}
              >
                View All Client History
              </button>
              <input
                type="text"
                placeholder="Search apartments..."
                value={search}
                onChange={handleSearch}
                className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full sm:w-72 text-black bg-white"
              />
            </div>
          </div>
          {apartments.length === 0 ? (
            <div className="empty-state">
              <h3>No apartments found.</h3>
              <p>Start by creating a new apartment above!</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {apartments.map((apt) => (
                <li key={apt._id} className="apartment-item">
                  <span className="font-semibold text-xl text-black">{apt.name}</span>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-yellow btn-sm"
                      onClick={() => { setSelectedApartment(apt); setShowModal(true); }}
                    >
                      View Details
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setEditingApartment(apt);
                        setEditApartmentName(apt.name);
                        setShowEditApartmentModal(true);
                        setEditApartmentError('');
                        setEditApartmentSuccess('');
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn btn-secondary btn-sm"
              >
                Previous
              </button>
              <span className="font-semibold text-black">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="btn btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showModal && selectedApartment && (
        <div className="modal-overlay">
          <div className="modal">
            {/* MODAL HEADER - ADJUSTED FOR RESPONSIVENESS */}
            <div className="modal-header flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              {/* Apartment Title */}
              <div>
                <h3 className="text-3xl font-bold">{selectedApartment.name}</h3>
                <p className="text-gray-400 text-sm">Manage bookings for this apartment</p>
              </div>

              {/* Action Buttons (Close) */}
              <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 sm:mt-0"> {/* Adjusted margin-top */}
                <button onClick={() => setShowModal(false)} className="close-btn">
                  &times;
                </button>
              </div>
            </div>
            {/* END MODAL HEADER */}

            <div className="modal-content">
              <div className="flex flex-col md:flex-row gap-6"> 
                {/* Booking Form */}
                <form
                  className="flex flex-col gap-4 w-full md:w-1/2" 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setBookingError('');
                    setBookingSuccess('');

                    // Basic validation
                    const requiredFields = ['clientName', 'phone', 'bookingDate', 'checkIn', 'checkOut', 'price', 'guests'];
                    let missingFields = requiredFields.filter(field => !bookingForm[field]);
                    // Only require paymentDate if advance is entered
                    if (bookingForm.advance && Number(bookingForm.advance) > 0) {
                      if (!bookingForm.paymentDate) missingFields.push('paymentDate');
                    }
                    if (missingFields.length > 0) {
                        setBookingError(`Please fill all required fields: ${missingFields.join(', ')}.`);
                        return;
                    }

                    // Date validation
                    const checkInDate = new Date(bookingForm.checkIn);
                    const checkOutDate = new Date(bookingForm.checkOut);
                    const bookingReqDate = new Date(bookingForm.bookingDate);

                    if (checkInDate > checkOutDate) {
                        setBookingError('Check-in date cannot be after check-out date.');
                        return;
                    }
                     if (bookingReqDate > checkInDate) {
                        setBookingError('Booking date cannot be after check-in date.');
                        return;
                    }

                    if (hasBookedDates) {
                      setShowRangeModal(true);
                      setShowRangeWarning(true);
                      return;
                    }


                    try {
                      if (editingBooking) {
                        await axios.put('https://backend-ruby-eight-64.vercel.app/api/bookings', {
                          clientName: bookingForm.clientName,
                          phone: bookingForm.phone,
                          email: bookingForm.email,
                          bookingDate: bookingForm.bookingDate,
                          checkIn: bookingForm.checkIn,
                          checkOut: bookingForm.checkOut,
                          price: Number(bookingForm.price),
                          specialNote: bookingForm.specialNote,
                          guests: Number(bookingForm.guests),
                          apartment: selectedApartment._id
                        }, {
                          params: { id: editingBooking }
                        });
                        setBookingSuccess('Booking updated successfully!');
                        setEditingBooking(null);
                      } else {
                        await axios.post('https://backend-ruby-eight-64.vercel.app/api/bookings', {
                          ...bookingForm,
                          apartment: selectedApartment._id,
                          price: Number(bookingForm.price),
                          advance: Number(bookingForm.advance) || 0,
                          guests: Number(bookingForm.guests)
                        });
                        setBookingSuccess('Booking created successfully!');
                      }
                      setBookingForm({
                        clientName: '', phone: '', email: '', bookingDate: '', checkIn: '', checkOut: '', price: '', advance: '', paymentMethod: '', specialNote: '', guests: '', paymentDate: ''
                      });
                      // Refresh bookings
                      const res = await axios.get('https://backend-ruby-eight-64.vercel.app/api/bookings', {
                        params: { apartmentId: selectedApartment._id }
                      });
                      setBookings(res.data);
                    } catch (err) {
                        setBookingError(err.response?.data?.message || 'Failed to save booking. Please try again.');
                    }
                  }}
                >
                  <div className="form-group vertical">
                    <label className="input-label">Client Name</label>
                    <input 
                      className="input-field" 
                      value={bookingForm.clientName} 
                      onChange={e => setBookingForm(f => ({ ...f, clientName: e.target.value }))} 
                      placeholder="Enter client's full name"
                    />
                  </div>
                  <div className="form-group vertical">
                    <label className="input-label">Phone Number</label>
                    <input
                      type="tel"
                      className="input-field"
                      value={bookingForm.phone}
                      onChange={e => setBookingForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="Enter phone number"
                      pattern="[0-9+\\-() ]*"
                      maxLength={20}
                    />
                  </div>
                  <div className="form-group vertical">
                    <label className="input-label">Email Address</label>
                    <input
                      type="email"
                      className="input-field"
                      value={bookingForm.email}
                      onChange={e => setBookingForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="form-group vertical">
                    <label className="input-label">Booking Date</label>
                    <input 
                      type="date" 
                      className="input-field" 
                      value={bookingForm.bookingDate} 
                      onChange={e => setBookingForm(f => ({ ...f, bookingDate: e.target.value }))} 
                    />
                  </div>
                  <div className="form-group vertical">
                    <label className="input-label">Check In</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        className="input-field" 
                        value={bookingForm.checkIn || ''} 
                        placeholder="Click calendar to select date"
                        readOnly
                        onClick={() => setShowCheckInCalendar(!showCheckInCalendar)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCheckInCalendar(!showCheckInCalendar)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        📅
                      </button>
                    </div>
                    {showCheckInCalendar && (
                      <div className="calendar-popup fixed z-[9999] bg-white border-2 border-red-500 rounded-lg shadow-lg p-3" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', minWidth: '320px' }}>
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
                          <h3 className="text-sm font-semibold text-gray-800">Select Check-in Date</h3>
                          <button 
                            onClick={() => setShowCheckInCalendar(false)}
                            className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                          >
                            ×
                          </button>
                        </div>
                        <Calendar
                          value={bookingForm.checkIn ? new Date(bookingForm.checkIn) : new Date()}
                          onChange={(date) => {
                            // Fix timezone issue by using local date string
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            const localDateString = `${year}-${month}-${day}`;
                            setBookingForm(f => ({ ...f, checkIn: localDateString }));
                            setShowCheckInCalendar(false);
                          }}
                          tileContent={({ date, view }) => {
                            if (view === 'month') {
                              const foundBookings = bookings.filter(b => {
                                if (editingBooking && b._id === editingBooking) {
                                  return false;
                                }
                                const checkIn = new Date(b.checkIn);
                                const checkOut = new Date(b.checkOut);
                                checkIn.setHours(0,0,0,0);
                                checkOut.setHours(0,0,0,0);
                                date.setHours(0,0,0,0);
                                return date >= checkIn && date < checkOut;
                              });
                              return foundBookings.length > 0 ? (
                                <div className="flex justify-center items-center mt-1">
                                  <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
                                </div>
                              ) : null;
                            }
                          }}
                          className="react-calendar-custom"
                          tileClassName={({ date, view }) => {
                            if (view === 'month') {
                              const today = new Date();
                              today.setHours(0,0,0,0);
                              date.setHours(0,0,0,0);
                              if (date.getTime() === today.getTime()) {
                                return 'today-highlight';
                              }
                            }
                            return '';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="form-group vertical">
                    <label className="input-label">Check Out</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        className="input-field" 
                        value={bookingForm.checkOut || ''} 
                        placeholder="Click calendar to select date"
                        readOnly
                        onClick={() => setShowCheckOutCalendar(!showCheckOutCalendar)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCheckOutCalendar(!showCheckOutCalendar)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        📅
                      </button>
                    </div>
                    {showCheckOutCalendar && (
                      <div className="calendar-popup fixed z-[9999] bg-white border-2 border-red-500 rounded-lg shadow-lg p-3" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', minWidth: '320px' }}>
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
                          <h3 className="text-sm font-semibold text-gray-800">Select Check-out Date</h3>
                          <button 
                            onClick={() => setShowCheckOutCalendar(false)}
                            className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                          >
                            ×
                          </button>
                        </div>
                        <Calendar
                          value={bookingForm.checkOut ? new Date(bookingForm.checkOut) : new Date()}
                          onChange={(date) => {
                            // Fix timezone issue by using local date string
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            const localDateString = `${year}-${month}-${day}`;
                            setBookingForm(f => ({ ...f, checkOut: localDateString }));
                            setShowCheckOutCalendar(false);
                          }}
                          tileContent={({ date, view }) => {
                            if (view === 'month') {
                              const foundBookings = bookings.filter(b => {
                                if (editingBooking && b._id === editingBooking) {
                                  return false;
                                }
                                const checkIn = new Date(b.checkIn);
                                const checkOut = new Date(b.checkOut);
                                checkIn.setHours(0,0,0,0);
                                checkOut.setHours(0,0,0,0);
                                date.setHours(0,0,0,0);
                                return date >= checkIn && date < checkOut;
                              });
                              return foundBookings.length > 0 ? (
                                <div className="flex justify-center items-center mt-1">
                                  <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
                                </div>
                              ) : null;
                            }
                          }}
                          className="react-calendar-custom"
                          tileClassName={({ date, view }) => {
                            if (view === 'month') {
                              const today = new Date();
                              today.setHours(0,0,0,0);
                              date.setHours(0,0,0,0);
                              if (date.getTime() === today.getTime()) {
                                return 'today-highlight';
                              }
                            }
                            return '';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  {/* Booked/Free Dates Info */}
                  {bookingForm.checkIn && bookingForm.checkOut && hasBookedDates && (
                    <div className="my-2">
                      <button
                        type="button"
                        className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 transition"
                        onClick={() => setShowRangeModal(true)}
                      >
                        Some dates in your range are already booked! View details
                      </button>
                    </div>
                  )}
                  {/* Range Modal */}
                  {showRangeModal && (
                    <div className="modal-overlay">
                      <div className="modal max-w-md">
                        <div className="modal-header flex justify-between items-center">
                          <h3 className="text-xl font-bold text-red-700">Selected Range Not Fully Available</h3>
                          <button onClick={() => setShowRangeModal(false)} className="close-btn">&times;</button>
                        </div>
                        <div className="modal-content">
                          <div className="mb-2 text-gray-700">You cannot book this range. Please choose different dates.</div>
                          {bookedDatesInRange.length > 0 && (
                            <div className="mb-4">
                              <div className="text-red-700 font-bold text-base mb-2 flex items-center gap-2">
                                <svg className="inline w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-1.414-1.414A9 9 0 105.636 18.364l1.414 1.414A9 9 0 1018.364 5.636z" /></svg>
                                Booked Dates & Details
                              </div>
                              <div className="space-y-3">
                                {bookedDatesInRange.map(d => {
                                  const dateStr = d.toISOString().slice(0,10);
                                  // Find the booking for this date
                                  const booking = bookings.find(b => {
                                    // Skip the current booking being edited
                                    if (editingBooking && b._id === editingBooking) {
                                      return false;
                                    }
                                    const bStart = new Date(b.checkIn);
                                    const bEnd = new Date(b.checkOut);
                                    bStart.setHours(0,0,0,0);
                                    bEnd.setHours(0,0,0,0);
                                    return d >= bStart && d <= bEnd;
                                  });
                                  return (
                                    <div key={dateStr} className="rounded-lg border border-red-200 bg-red-50 p-3 shadow-sm flex flex-col sm:flex-row sm:items-center gap-2">
                                      <div className="font-semibold text-red-700 flex-shrink-0 w-28">{dateStr}</div>
                                      <div className="flex-1">
                                        <div className="font-bold text-black">{booking?.clientName || bookedDateInfo[dateStr]}</div>
                                        {booking?.phone && <div className="text-xs text-gray-700">Phone: {booking.phone}</div>}
                                        <div className="text-xs text-gray-700">Check-in: {booking?.checkIn ? formatDate(booking.checkIn) : ''} | Check-out: {booking?.checkOut ? formatDate(booking.checkOut) : ''}</div>
                                        <div className="text-xs text-gray-700">Guests: {booking?.guests} | Price: ${booking?.price} | Advance: ${booking?.advance || 0} | Due: ${booking ? booking.price - (booking.advance || 0) : ''}</div>
                                        <div className="text-xs mt-1">
                                          Status: <span className={booking?.paid ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{booking?.paid ? 'Paid' : 'Not Paid'}</span>
                                        </div>
                                        {booking?.specialNote && <div className="text-xs text-gray-500 italic mt-1">Note: {booking.specialNote}</div>}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {freeDatesInRange.length > 0 && (
                            <div className="text-green-700 text-sm mb-2">
                              <strong>Free Dates:</strong>
                              <ul className="list-disc ml-5">
                                {freeDatesInRange.map(d => (
                                  <li key={d.toISOString()}>{formatDate(d.toISOString())}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="form-group vertical">
                    <label className="input-label">Price ($)</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      value={bookingForm.price} 
                      onChange={e => setBookingForm(f => ({ ...f, price: e.target.value }))} 
                      placeholder="e.g., 250.00"
                    />
                  </div>
                  {!editingBooking && (
                    <>
                      <div className="form-group vertical">
                        <label className="input-label">Advance Payment ($)</label>
                        <input 
                          type="number" 
                          className="input-field" 
                          value={bookingForm.advance} 
                          onChange={e => setBookingForm(f => ({ ...f, advance: e.target.value }))} 
                          placeholder="e.g., 50.00 (default 0)"
                        />
                      </div>
                      <div className="form-group vertical">
                        <label className="input-label">Advance Payment Date</label>
                        <input
                          type="date"
                          className="input-field"
                          value={bookingForm.paymentDate}
                          onChange={e => setBookingForm(f => ({ ...f, paymentDate: e.target.value }))}
                          placeholder="Select advance payment date"
                        />
                      </div>
                      <div className="form-group vertical">
                        <label className="input-label">Payment Method</label>
                        <input 
                          className="input-field" 
                          value={bookingForm.paymentMethod} 
                          onChange={e => setBookingForm(f => ({ ...f, paymentMethod: e.target.value }))} 
                          placeholder="e.g., Cash, Card, Bank Transfer"
                        />
                      </div>
                    </>
                  )}

                  <div className="form-group vertical">
                    <label className="input-label">Number of Guests</label>
                    <input 
                      type="number" 
                      min="1" 
                      className="input-field" 
                      value={bookingForm.guests} 
                      onChange={e => setBookingForm(f => ({ ...f, guests: e.target.value }))} 
                      placeholder="e.g., 2"
                    />
                  </div>
                  <div className="form-group vertical">
                    <label className="input-label">Special Note</label>
                    <textarea 
                      className="input-field h-24 resize-y" // Added h-24 for fixed height, resize-y for vertical resize
                      value={bookingForm.specialNote} 
                      onChange={e => setBookingForm(f => ({ ...f, specialNote: e.target.value }))} 
                      placeholder="Any specific requests or details..."
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button type="submit" className="btn btn-primary flex-1" disabled={hasBookedDates}>
                      {editingBooking ? 'Update Booking' : 'Add Booking'}
                    </button>
      
                    {editingBooking && (
                      <button type="button" className="btn btn-secondary flex-1" onClick={() => { 
                        setEditingBooking(null); 
                        setBookingForm({ 
                          clientName: '', 
                          phone: '', 
                          email: '', 
                          bookingDate: '', 
                          checkIn: '', 
                          checkOut: '', 
                          price: '', 
                          advance: '', 
                          paymentMethod: '', 
                          paid: false, 
                          specialNote: '', 
                          guests: '', 
                          paymentDate: '' 
                        }); 
                      }}>
                        Cancel Edit
                      </button>
                    )}
                  </div>
                  {bookingError && <div className="message error mt-2">{bookingError}</div>}
                  {bookingSuccess && <div className="message success mt-2">{bookingSuccess}</div>}
                </form>

                {/* Booking Calendar and List */}
                <div className="w-full md:w-1/2"> {/* Added width class */}
                  <label className="font-semibold block mb-2 text-black">Bookings Calendar</label>
                  <div className="calendar-container">
                    <Calendar
                      value={calendarDate}
                      onChange={setCalendarDate}
                      onClickDay={date => {
                        // Set hours to 0 for comparison
                        const clicked = new Date(date);
                        clicked.setHours(0,0,0,0);
                        const bookingsForDate = bookings.filter(b => {
                          // Skip the current booking being edited
                          if (editingBooking && b._id === editingBooking) {
                            return false;
                          }
                          const checkIn = new Date(b.checkIn);
                          const checkOut = new Date(b.checkOut);
                          checkIn.setHours(0,0,0,0);
                          checkOut.setHours(0,0,0,0);
                          return clicked >= checkIn && clicked < checkOut;
                        });
                        setSelectedDateBookings(bookingsForDate);
                        setShowDateModal(true);
                      }}
                      tileContent={({ date, view }) => {
                        if (view === 'month') {
                          const foundBookings = bookings.filter(b => {
                            // Skip the current booking being edited
                            if (editingBooking && b._id === editingBooking) {
                              return false;
                            }
                            const checkIn = new Date(b.checkIn);
                            const checkOut = new Date(b.checkOut);
                            // Set hours to 0 to compare dates only
                            checkIn.setHours(0,0,0,0);
                            checkOut.setHours(0,0,0,0);
                            date.setHours(0,0,0,0);
                                                      return date >= checkIn && date < checkOut; // Changed from <= to < to exclude check-out date
                        });
                        return foundBookings.length > 0 ? (
                            <div
                              className="flex justify-center mt-1 relative"
                              onMouseEnter={() => { setHoveredDate(date); setHoveredBooking(foundBookings); }}
                              onMouseLeave={() => { setHoveredDate(null); setHoveredBooking(null); }}
                            >
                              <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
                              {hoveredDate && date.toDateString() === hoveredDate.toDateString() && hoveredBooking && (
                                <div className="absolute z-50 left-1/2 -translate-x-1/2 top-6 bg-white border border-gray-300 rounded shadow-lg p-2 text-xs min-w-[200px] max-h-40 overflow-y-auto text-black">
                                  {hoveredBooking.map((hb, index) => (
                                    <div key={index} className="mb-1 pb-1 border-b last:border-b-0 border-gray-200">
                                      <div><span className="font-semibold">{hb.clientName}</span></div>
                                                                        <div>Check-in: {formatDate(hb.checkIn)}</div>
                                  <div>Check-out: {formatDate(hb.checkOut)}</div>
                                      <div>Guests: {hb.guests}</div>
                                      <div>Price: ${hb.price}</div>
                                      <div>{hb.paid ? <span className="text-green-600 font-medium">Paid</span> : <span className="text-red-600 font-medium">Not Paid</span>}</div>
                                      <div className="text-gray-500 text-xs">{hb.specialNote || 'No special note.'}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : null;
                        }
                      }}
                      tileClassName={({ date, view }) => {
                        if (view === 'month') {
                          // Check if it's Saturday (day 6)
                          if (date.getDay() === 6) {
                            return 'saturday-red';
                          }
                        }
                        return '';
                      }}
                      className="react-calendar-custom" // Custom class for styling
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-4 mb-2">
                    <input
                      type="text"
                      placeholder="Search bookings by client..."
                      value={bookingSearch}
                      onChange={e => { setBookingSearch(e.target.value); setBookingPage(1); }}
                      className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 flex-1 text-black bg-white"
                    />
                  </div>
                  {paginatedBookings.length === 0 ? (
                    <div className="empty-state text-sm py-4">
                      <p>No bookings found for this search.</p>
                    </div>
                  ) : (
                    <ul className="mt-2 space-y-3 pr-2">
                      {paginatedBookings.map(b => (
                        <li key={b._id} className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-lg shadow p-2 mb-2 hover:shadow-lg transition group">
                          {/* Left: Main Info */}
                          <div className="flex-1 flex flex-col gap-0 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-bold text-base text-black truncate max-w-[120px]">{b.clientName}</span>
                              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${isBookingPaid(b) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{isBookingPaid(b) ? 'Paid' : 'Not Paid'}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                              <span className="flex items-center gap-1"><span role="img" aria-label="Calendar">📅</span> {formatDate(b.checkIn)} - {formatDate(b.checkOut)}</span>
                              <span className="flex items-center gap-1"><span role="img" aria-label="Guests">👥</span> {b.guests}</span>
                              {b.phone && <span className="flex items-center gap-1"><span role="img" aria-label="Phone">📞</span> {b.phone}</span>}
                              {b.email && b.email.trim() !== '' && <span className="flex items-center gap-1"><span role="img" aria-label="Email">📧</span> {b.email}</span>}
                            </div>
                          </div>
                          {/* Middle: Payment Info */}
                          <div className="flex flex-col items-start sm:items-center gap-0.5 mx-0 sm:mx-4 mt-2 sm:mt-0">
                            <span className="flex items-center gap-1 text-xs text-gray-700"><span role="img" aria-label="Money">💰</span> <span className="font-semibold">${b.price}</span></span>
                            <span className="flex items-center gap-1 text-xs text-gray-700">Paid: <span className="font-semibold">${getTotalPaid(b)}</span></span>
                            <span className="flex items-center gap-1 text-xs text-gray-700">Due: <span className="font-semibold">${getDue(b)}</span></span>
                          </div>
                          {/* Right: Actions - horizontal, small */}
                          <div className="flex flex-row gap-1 mt-2 sm:mt-0 sm:ml-2 items-center">
                            {b.phone && (
                              <button
                                title="Contact via WhatsApp"
                                onClick={() => {
                                  const phone = b.phone.replace(/[^\d]/g, '');
                                  window.open(`https://wa.me/${phone}`, '_blank');
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white rounded-full p-1 shadow transition flex items-center justify-center text-xs"
                                style={{ width: 28, height: 28 }}
                              >
                                <WhatsAppIcon />
                              </button>
                            )}
                            {b.email && b.email.trim() !== '' && (
                              <button
                                title="Send Email"
                                onClick={() => {
                                  window.open(`mailto:${b.email}`, '_blank');
                                }}
                                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 shadow transition flex items-center justify-center text-xs"
                                style={{ width: 28, height: 28 }}
                              >
                                <EmailIcon />
                              </button>
                            )}
                            <button title="Print" onClick={() => printBooking(b)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-1 shadow transition flex items-center justify-center text-xs" aria-label="Print" style={{ width: 28, height: 28 }}><span role="img" aria-label="Print">🖨️</span></button>
                            <button title="Edit" onClick={() => {
                              setEditingBooking(b._id);
                              setBookingForm({
                                clientName: b.clientName,
                                phone: b.phone || '',
                                email: b.email && b.email.trim() !== '' ? b.email : '',
                                bookingDate: b.bookingDate ? new Date(b.bookingDate).toISOString().slice(0, 10) : '',
                                checkIn: b.checkIn ? new Date(b.checkIn).toISOString().slice(0, 10) : '',
                                checkOut: b.checkOut ? new Date(b.checkOut).toISOString().slice(0, 10) : '',
                                price: b.price,
                                advance: '', // Don't set advance when editing
                                paymentMethod: '', // Don't set payment method when editing
                                specialNote: b.specialNote,
                                guests: b.guests,
                                paymentDate: '' // Don't set payment date when editing
                              });
                            }} className="bg-blue-200 hover:bg-blue-300 text-blue-700 rounded-full p-1 shadow transition flex items-center justify-center text-xs" aria-label="Edit" style={{ width: 28, height: 28 }}><span role="img" aria-label="Edit">✏️</span></button>
                            <button
                              className="bg-yellow-400 hover:bg-yellow-500 text-black rounded-full p-1 shadow font-semibold transition flex items-center justify-center text-xs"
                              title="Record Payment"
                              onClick={() => {
                                setPaymentsBooking(b);
                                setPaymentHistory(b.payments || []);
                                setShowPaymentsModal(true);
                                setPaymentModalError('');
                                setPaymentModalSuccess('');
                                setIsEditingPayment(null);
                                // Refresh bookings data to ensure we have the latest payment information
                                axios.get('https://backend-ruby-eight-64.vercel.app/api/bookings', {
                                  params: { apartmentId: selectedApartment._id }
                                }).then(res => {
                                  setBookings(res.data);
                                  // Update the current booking with fresh data
                                  const updatedBooking = res.data.find(booking => booking._id === b._id);
                                  if (updatedBooking) {
                                    setPaymentsBooking(updatedBooking);
                                    setPaymentHistory(updatedBooking.payments || []);
                                  }
                                }).catch(err => {
                                  console.error('Failed to refresh bookings:', err);
                                });
                              }}
                              aria-label="Record Payment"
                              style={{ width: 28, height: 28 }}
                            >
                              <span role="img" aria-label="Pay">💵</span>
                            </button>
                            <button
                              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow transition flex items-center justify-center text-xs"
                              title="Delete Booking"
                              onClick={() => {
                                setBookingToDelete(b);
                                setShowDeleteBookingModal(true);
                                setDeleteBookingError('');
                                setDeleteBookingSuccess('');
                              }}
                              aria-label="Delete"
                              style={{ width: 28, height: 28 }}
                            >
                              <span role="img" aria-label="Delete">🗑️</span>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {totalBookingPages > 1 && (
                    <div className="pagination mt-4">
                      <button
                        onClick={() => setBookingPage(bookingPage - 1)}
                        disabled={bookingPage === 1}
                        className="btn btn-secondary btn-sm"
                      >
                        Prev
                      </button>
                      <span className="font-semibold text-xs text-black">Page {bookingPage} of {totalBookingPages}</span>
                      <button
                        onClick={() => setBookingPage(bookingPage + 1)}
                        disabled={bookingPage === totalBookingPages}
                        className="btn btn-secondary btn-sm"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDateModal && (
        <div className="modal-overlay">
          <div className="modal max-w-md">
            <div className="modal-header flex justify-between items-center">
              <h3 className="text-xl font-bold">Bookings for {calendarDate.toLocaleDateString()}</h3>
              <button onClick={() => setShowDateModal(false)} className="close-btn">&times;</button>
            </div>
            <div className="modal-content">
              {selectedDateBookings.length === 0 ? (
                <div className="empty-state text-sm py-4">No bookings for this date.</div>
              ) : (
                <ul className="space-y-4 pr-2">
                  {selectedDateBookings.map((b, idx) => (
                    <li key={b._id || idx} className="bg-white border rounded-lg shadow p-4 mb-3">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                        <div>
                          <div className="font-bold text-lg text-black mb-1">{b.clientName}</div>
                          <div className="text-xs text-gray-500 mb-1">Phone: {b.phone || 'N/A'}</div>
                          <div className="text-xs text-gray-500 mb-1">Email: {b.email && b.email.trim() !== '' ? b.email : 'N/A'}</div>
                                                      <div className="text-xs text-gray-500 mb-1">Booking Date: {b.bookingDate ? formatDate(b.bookingDate) : 'N/A'}</div>
                        </div>
                        <div className="flex flex-col gap-1 text-xs text-gray-700">
                                                      <div>Check In: <span className="font-semibold">{formatDate(b.checkIn)}</span></div>
                            <div>Check Out: <span className="font-semibold">{formatDate(b.checkOut)}</span></div>
                          <div>Guests: <span className="font-semibold">{b.guests}</span></div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-700 mb-2">
                        <div>Price: <span className="font-semibold">${b.price}</span></div>
                        <div>Paid: <span className="font-semibold">${getTotalPaid(b)}</span></div>
                        <div>Due: <span className="font-semibold">${getDue(b)}</span></div>
                      </div>
                      <div className="mb-2 text-xs text-gray-700">Special Note: <span className="italic">{b.specialNote || 'N/A'}</span></div>
                      <div className="flex items-center gap-2 mb-2">
                        {isBookingPaid(b) ? (
                          <span className="flex items-center gap-1"><span title='Paid' role='img' aria-label='Paid'>✅</span><span className="text-green-600 text-xs font-semibold">Paid</span></span>
                        ) : (
                          <span className="flex items-center gap-1"><span title='Not Paid' role='img' aria-label='Not Paid'>❌</span><span className="text-red-600 text-xs font-semibold">Not Paid</span></span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        {b.phone && (
                          <button
                            title="Contact via WhatsApp"
                            onClick={() => {
                              const phone = b.phone.replace(/[^\d]/g, '');
                              window.open(`https://wa.me/${phone}`, '_blank');
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 text-xs font-semibold shadow transition flex items-center justify-center"
                          >
                            <WhatsAppIcon />
                          </button>
                        )}
                        {b.email && b.email.trim() !== '' && (
                          <button
                            title="Send Email"
                            onClick={() => {
                              window.open(`mailto:${b.email}`, '_blank');
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 text-xs font-semibold shadow transition flex items-center justify-center"
                          >
                            <EmailIcon />
                          </button>
                        )}
                        <button title="Print" onClick={() => printBooking(b)} className="btn btn-secondary btn-xs px-1"><span role="img" aria-label="Print">🖨️</span></button>
                        <button title="Edit" onClick={() => {
                          setEditingBooking(b._id);
                          setBookingForm({
                            clientName: b.clientName,
                            phone: b.phone || '',
                            email: b.email && b.email.trim() !== '' ? b.email : '',
                            bookingDate: b.bookingDate ? new Date(b.bookingDate).toISOString().slice(0, 10) : '',
                            checkIn: b.checkIn ? new Date(b.checkIn).toISOString().slice(0, 10) : '',
                            checkOut: b.checkOut ? new Date(b.checkOut).toISOString().slice(0, 10) : '',
                            price: b.price,
                            advance: '', // Don't set advance when editing
                            paymentMethod: '', // Don't set payment method when editing
                            specialNote: b.specialNote,
                            guests: b.guests,
                            paymentDate: '' // Don't set payment date when editing
                          });
                          setShowDateModal(false);
                        }} className="btn btn-secondary btn-xs px-1"><span role="img" aria-label="Edit">✏️</span></button>
                        <button title="Record Payment" onClick={() => {
                          setPaymentsBooking(b);
                          setPaymentHistory(b.payments || []);
                          setShowPaymentsModal(true);
                          setPaymentModalError('');
                          setPaymentModalSuccess('');
                          setIsEditingPayment(null);
                          setShowDateModal(false);
                          // Refresh bookings data to ensure we have the latest payment information
                          axios.get('https://backend-ruby-eight-64.vercel.app/api/bookings', {
                            params: { apartmentId: selectedApartment._id }
                          }).then(res => {
                            setBookings(res.data);
                            // Update the current booking with fresh data
                            const updatedBooking = res.data.find(booking => booking._id === b._id);
                            if (updatedBooking) {
                              setPaymentsBooking(updatedBooking);
                              setPaymentHistory(updatedBooking.payments || []);
                            }
                          }).catch(err => {
                            console.error('Failed to refresh bookings:', err);
                          });
                        }} className="btn btn-yellow btn-xs font-semibold px-1"><span role="img" aria-label="Pay">💵</span></button>
                        <button title="Delete Booking" onClick={() => {
                          setBookingToDelete(b);
                          setShowDeleteBookingModal(true);
                          setDeleteBookingError('');
                          setDeleteBookingSuccess('');
                          setShowDateModal(false);
                        }} className="btn btn-secondary btn-xs px-1"><span role="img" aria-label="Delete">🗑️</span></button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
      {showRangeWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded shadow-lg z-50 animate-bounce">
          Cannot book: some dates are already booked.
          <button className="ml-4 text-white font-bold" onClick={() => setShowRangeWarning(false)}>&times;</button>
        </div>
      )}
      {showPaymentModal && paymentBooking && (
        <div className="modal-overlay">
          <div className="modal max-w-md">
            <div className="modal-header flex justify-between items-center">
              <h3 className="text-xl font-bold">Record Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="close-btn">&times;</button>
            </div>
            <div className="modal-content">
                              <div className="mb-2 text-gray-700">Booking for <span className="font-semibold">{paymentBooking.clientName}</span> ({formatDate(paymentBooking.checkIn)} to {formatDate(paymentBooking.checkOut)})</div>
              <div className="mb-2 text-sm">Total Price: <span className="font-semibold">${paymentBooking.price}</span></div>
              <div className="mb-2 text-sm">Already Paid: <span className="font-semibold">${paymentBooking.advance || 0}</span></div>
              <div className="mb-2 text-sm">Due: <span className="font-semibold">${paymentBooking.price - (paymentBooking.advance || 0)}</span></div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setPaymentError('');
                setPaymentSuccess('');
                const pay = Number(paymentAmount);
                if (!pay || pay <= 0) {
                  setPaymentError('Enter a valid payment amount.');
                  return;
                }
                const newAdvance = (Number(paymentBooking.advance) || 0) + pay;
                if (newAdvance > paymentBooking.price) {
                  setPaymentError('Total paid cannot exceed total price.');
                  return;
                }
                try {
                  await axios.put('https://backend-ruby-eight-64.vercel.app/api/bookings', {
                    ...paymentBooking,
                    advance: newAdvance,
                    paid: newAdvance >= paymentBooking.price,
                  }, {
                    params: { id: paymentBooking._id }
                  });
                  setPaymentSuccess('Payment recorded successfully!');
                  setTimeout(() => {
                    setShowPaymentModal(false);
                    setPaymentBooking(null);
                    setPaymentAmount('');
                    setPaymentError('');
                    setPaymentSuccess('');
                    // Refresh bookings
                    axios.get('https://backend-ruby-eight-64.vercel.app/api/bookings', {
                      params: { apartmentId: selectedApartment._id }
                    }).then(res => setBookings(res.data));
                  }, 1200);
                } catch (err) {
                  setPaymentError('Failed to record payment.');
                }
              }}>
                <input
                  type="number"
                  className="input-field mb-2"
                  placeholder="Enter payment amount"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  min="1"
                  max={paymentBooking.price - (paymentBooking.advance || 0)}
                />
                <button type="submit" className="btn btn-primary w-full">Submit Payment</button>
              </form>
              {paymentError && <div className="message error mt-2">{paymentError}</div>}
              {paymentSuccess && <div className="message success mt-2">{paymentSuccess}</div>}
            </div>
          </div>
        </div>
      )}
      {showPaymentsModal && paymentsBooking && (
        <div className="modal-overlay z-50">
          <div className="modal max-w-lg">
            <div className="modal-header flex justify-between items-center">
              <h3 className="text-xl font-bold">Payments for {paymentsBooking.clientName}</h3>
              <button onClick={() => setShowPaymentsModal(false)} className="close-btn">&times;</button>
            </div>
            <div className="modal-content">
              {/* Summary */}
              <div className="mb-4 p-2 bg-gray-50 rounded flex flex-wrap gap-4 text-sm">
                <div>Total Price: <span className="font-semibold">${paymentsBooking.price}</span></div>
                <div>Total Paid: <span className="font-semibold">${(displayPayments.reduce((sum, p) => sum + Number(p.amount), 0)).toFixed(2)}</span></div>
                <div>Balance Due: <span className="font-semibold">${(paymentsBooking.price - displayPayments.reduce((sum, p) => sum + Number(p.amount), 0)).toFixed(2)}</span></div>
                <div>Status: {displayPayments.reduce((sum, p) => sum + Number(p.amount), 0) >= paymentsBooking.price ? <span className="text-green-600 font-semibold">Paid</span> : <span className="text-red-600 font-semibold">Not Paid</span>}</div>
              </div>
              {/* Payment History Table */}
              <div className="mb-4">
                <div className="font-semibold mb-2">Payment History</div>
                {displayPayments.length === 0 ? (
                  <div className="text-xs text-gray-500">No payments yet.</div>
                ) : (
                  <table className="w-full text-xs border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-1 border">Date</th>
                        <th className="p-1 border">Amount</th>
                        <th className="p-1 border">Method</th>
                        <th className="p-1 border">Note</th>
                        <th className="p-1 border">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayPayments.map((p, idx) => (
                        <tr key={p._id || idx}>
                          <td className="p-1 border">{p.date ? new Date(p.date).toLocaleDateString() : ''}</td>
                          <td className="p-1 border">${p.amount}</td>
                          <td className="p-1 border">{p.method}</td>
                          <td className="p-1 border">{p.note}</td>
                          <td className="p-1 border">
                            {paymentHistory.length > 0 && (
                              <button className="text-blue-600 mr-1" onClick={() => {
                                setIsEditingPayment(p._id || idx);
                                setNewPayment({ date: p.date ? formatDate(p.date) : '', amount: p.amount, method: p.method, note: p.note });
                              }}>Edit</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {/* Add/Edit Payment Form */}
              <div className="mb-2">
                <div className="font-semibold mb-1">{isEditingPayment ? 'Edit Payment' : 'Add Payment'}</div>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setPaymentModalError('');
                  setPaymentModalSuccess('');
                  if (!newPayment.date || !newPayment.amount || !newPayment.method) {
                    setPaymentModalError('Date, amount, and method are required.');
                    return;
                  }
                  try {
                    if (isEditingPayment) {
                      // Edit payment
                      try {
                        const res = await axios.put('https://backend-ruby-eight-64.vercel.app/api/bookings/payments', {
                          bookingId: paymentsBooking._id,
                          paymentId: isEditingPayment,
                          payment: newPayment
                        });
                        const updated = res.data;
                        setPaymentHistory(updated.payments || []);
                        setPaymentsBooking(updated);
                        // After updating payments, update paid status in DB
                        const totalPaid = (updated.payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
                        const isPaid = Math.abs(Number(totalPaid) - Number(updated.price)) < 0.01 || Number(totalPaid) > Number(updated.price);
                        try {
                          await axios.put('https://backend-ruby-eight-64.vercel.app/api/bookings/paid', {
                            bookingId: updated._id,
                            paid: isPaid
                          });
                        } catch (err) {
                          // Optionally log error, but don't block UI
                          console.error('Failed to update paid status:', err.response?.data?.message || err.message);
                        }
                        setPaymentModalSuccess('Payment updated!');
                        setIsEditingPayment(null);
                        setNewPayment({ date: '', amount: '', method: '', note: '' });
                        // Refresh bookings data to update the modal in real-time
                        try {
                          const res = await axios.get('https://backend-ruby-eight-64.vercel.app/api/bookings', {
                            params: { apartmentId: selectedApartment._id }
                          });
                          setBookings(res.data);
                        } catch (err) {
                          console.error('Failed to refresh bookings:', err);
                        }
                      } catch (err) {
                        setPaymentModalError(err.response?.data?.message || 'Failed to update payment');
                      }
                    } else {
                      // Add payment
                      try {
                        const res = await axios.post('https://backend-ruby-eight-64.vercel.app/api/bookings/payments', {
                          bookingId: paymentsBooking._id,
                          payment: newPayment
                        });
                        const updated = res.data;
                        setPaymentHistory(updated.payments || []);
                        setPaymentsBooking(updated);
                        // After updating payments, update paid status in DB
                        const totalPaid = (updated.payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
                        const isPaid = Math.abs(Number(totalPaid) - Number(updated.price)) < 0.01 || Number(totalPaid) > Number(updated.price);
                        try {
                          await axios.put('https://backend-ruby-eight-64.vercel.app/api/bookings/paid', {
                            bookingId: updated._id,
                            paid: isPaid
                          });
                        } catch (err) {
                          // Optionally log error, but don't block UI
                          console.error('Failed to update paid status:', err.response?.data?.message || err.message);
                        }
                        setPaymentModalSuccess('Payment added!');
                        setNewPayment({ date: '', amount: '', method: '', note: '' });
                        // Refresh bookings data to update the modal in real-time
                        try {
                          const res = await axios.get('https://backend-ruby-eight-64.vercel.app/api/bookings', {
                            params: { apartmentId: selectedApartment._id }
                          });
                          setBookings(res.data);
                        } catch (err) {
                          console.error('Failed to refresh bookings:', err);
                        }
                      } catch (err) {
                        setPaymentModalError(err.response?.data?.message || 'Failed to add payment');
                      }
                    }
                  } catch (err) {
                    setPaymentModalError(err.message || 'Error saving payment');
                  }
                }} className="flex flex-wrap gap-2 items-end">
                  <input type="date" className="input-field" value={newPayment.date} onChange={e => setNewPayment(f => ({ ...f, date: e.target.value }))} required />
                  <input type="number" className="input-field" placeholder="Amount" value={newPayment.amount} onChange={e => setNewPayment(f => ({ ...f, amount: e.target.value }))} required min="1" />
                  <input className="input-field" placeholder="Method" value={newPayment.method} onChange={e => setNewPayment(f => ({ ...f, method: e.target.value }))} required />
                  <input className="input-field" placeholder="Note" value={newPayment.note} onChange={e => setNewPayment(f => ({ ...f, note: e.target.value }))} />
                  <button type="submit" className="btn btn-primary btn-xs">{isEditingPayment ? 'Update' : 'Add'}</button>
                  {isEditingPayment && (
                    <button type="button" className="btn btn-secondary btn-xs" onClick={() => { setIsEditingPayment(null); setNewPayment({ date: '', amount: '', method: '', note: '' }); }}>Cancel</button>
                  )}
                </form>
                {paymentModalError && <div className="message error mt-1">{paymentModalError}</div>}
                {paymentModalSuccess && <div className="message success mt-1">{paymentModalSuccess}</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="modal-overlay">
          <div className="modal max-w-md">
            <div className="modal-header">
              <h3 className="text-xl font-bold">Change Password</h3>
              <button onClick={() => setShowChangePasswordModal(false)} className="close-btn">
                &times;
              </button>
            </div>
            <div className="modal-content">
              <form onSubmit={async (e) => {
                e.preventDefault();
                setChangePasswordError('');
                setChangePasswordSuccess('');

                // Validation
                if (!changePasswordForm.currentPassword || !changePasswordForm.newPassword || !changePasswordForm.confirmPassword) {
                  setChangePasswordError('All fields are required');
                  return;
                }

                if (changePasswordForm.newPassword.length < 6) {
                  setChangePasswordError('New password must be at least 6 characters long');
                  return;
                }

                if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
                  setChangePasswordError('New passwords do not match');
                  return;
                }

                try {
                  // Get user email from localStorage or you might need to store it during login
                  const userEmail = localStorage.getItem('userEmail') || 'admin@bait.com'; // Default fallback
                  
                  await axios.post('https://backend-ruby-eight-64.vercel.app/api/changePassword', {
                    currentPassword: changePasswordForm.currentPassword,
                    newPassword: changePasswordForm.newPassword,
                    email: userEmail
                  });

                  setChangePasswordSuccess('Password changed successfully!');
                  setChangePasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                  setShowPasswords({
                    current: false,
                    new: false,
                    confirm: false
                  });
                  
                  // Close modal after 2 seconds
                  setTimeout(() => {
                    setShowChangePasswordModal(false);
                    setChangePasswordSuccess('');
                  }, 2000);
                } catch (err) {
                  setChangePasswordError(err.response?.data?.message || 'Failed to change password');
                }
              }}>
                <div className="form-group vertical">
                  <label className="input-label">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      className="input-field pr-10"
                      value={changePasswordForm.currentPassword}
                      onChange={e => setChangePasswordForm(f => ({ ...f, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-lg"
                      onClick={() => setShowPasswords(s => ({ ...s, current: !s.current }))}
                    >
                      {showPasswords.current ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
                <div className="form-group vertical">
                  <label className="input-label">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      className="input-field pr-10"
                      value={changePasswordForm.newPassword}
                      onChange={e => setChangePasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                      placeholder="Enter new password (min 6 characters)"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-lg"
                      onClick={() => setShowPasswords(s => ({ ...s, new: !s.new }))}
                    >
                      {showPasswords.new ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
                <div className="form-group vertical">
                  <label className="input-label">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      className="input-field pr-10"
                      value={changePasswordForm.confirmPassword}
                      onChange={e => setChangePasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-lg"
                      onClick={() => setShowPasswords(s => ({ ...s, confirm: !s.confirm }))}
                    >
                      {showPasswords.confirm ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="btn btn-primary flex-1">
                    Change Password
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary flex-1"
                    onClick={() => {
                      setShowChangePasswordModal(false);
                      setChangePasswordForm({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setShowPasswords({
                        current: false,
                        new: false,
                        confirm: false
                      });
                      setChangePasswordError('');
                      setChangePasswordSuccess('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
                {changePasswordError && <div className="message error mt-2">{changePasswordError}</div>}
                {changePasswordSuccess && <div className="message success mt-2">{changePasswordSuccess}</div>}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Apartment Modal */}
      {showEditApartmentModal && editingApartment && (
        <div className="modal-overlay">
          <div className="modal max-w-md">
            <div className="modal-header">
              <h3 className="text-xl font-bold">Edit Apartment</h3>
              <button onClick={() => setShowEditApartmentModal(false)} className="close-btn">
                &times;
              </button>
            </div>
            <div className="modal-content">
              <form onSubmit={async (e) => {
                e.preventDefault();
                setEditApartmentError('');
                setEditApartmentSuccess('');

                if (!editApartmentName.trim()) {
                  setEditApartmentError('Apartment name is required');
                  return;
                }

                try {
                  await axios.put(`https://backend-ruby-eight-64.vercel.app/api/apartments`, {
                    name: editApartmentName.trim()
                  }, {
                    params: { id: editingApartment._id }
                  });

                  setEditApartmentSuccess('Apartment updated successfully!');
                  
                  // Refresh apartments list
                  fetchApartments(page, search);
                  
                  // Close modal after 2 seconds
                  setTimeout(() => {
                    setShowEditApartmentModal(false);
                    setEditingApartment(null);
                    setEditApartmentName('');
                    setEditApartmentError('');
                    setEditApartmentSuccess('');
                  }, 2000);
                } catch (err) {
                  setEditApartmentError(err.response?.data?.message || 'Failed to update apartment');
                }
              }}>
                <div className="form-group vertical">
                  <label className="input-label">Apartment Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editApartmentName}
                    onChange={e => setEditApartmentName(e.target.value)}
                    placeholder="Enter apartment name"
                    required
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="btn btn-primary flex-1">
                    Update Apartment
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary flex-1"
                    onClick={() => {
                      setShowEditApartmentModal(false);
                      setEditingApartment(null);
                      setEditApartmentName('');
                      setEditApartmentError('');
                      setEditApartmentSuccess('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
                {editApartmentError && <div className="message error mt-2">{editApartmentError}</div>}
                {editApartmentSuccess && <div className="message success mt-2">{editApartmentSuccess}</div>}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Booking Modal */}
      {showDeleteBookingModal && bookingToDelete && (
        <div className="modal-overlay">
          <div className="modal max-w-md">
            <div className="modal-header">
              <h3 className="text-xl font-bold text-red-600">Delete Booking</h3>
              <button onClick={() => setShowDeleteBookingModal(false)} className="close-btn">
                &times;
              </button>
            </div>
            <div className="modal-content">
              <div className="mb-4">
                <p className="text-gray-700 mb-2">Are you sure you want to delete this booking?</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-semibold text-black">{bookingToDelete.clientName}</div>
                  <div className="text-sm text-gray-600">
                    Check-in: {formatDate(bookingToDelete.checkIn)} | Check-out: {formatDate(bookingToDelete.checkOut)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Guests: {bookingToDelete.guests} | Price: ${bookingToDelete.price}
                  </div>
                </div>
                <p className="text-red-600 text-sm mt-2 font-semibold">This action cannot be undone!</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-primary flex-1 bg-red-600 hover:bg-red-700"
                  onClick={async () => {
                    try {
                      await axios.delete(`https://backend-ruby-eight-64.vercel.app/api/bookings`, {
                        params: { id: bookingToDelete._id }
                      });
                      
                      setDeleteBookingSuccess('Booking deleted successfully!');
                      
                      // Refresh bookings
                      const res = await axios.get('https://backend-ruby-eight-64.vercel.app/api/bookings', {
                        params: { apartmentId: selectedApartment._id }
                      });
                      setBookings(res.data);
                      
                      // Close modal after 2 seconds
                      setTimeout(() => {
                        setShowDeleteBookingModal(false);
                        setBookingToDelete(null);
                        setDeleteBookingError('');
                        setDeleteBookingSuccess('');
                      }, 2000);
                    } catch (err) {
                      setDeleteBookingError(err.response?.data?.message || 'Failed to delete booking');
                    }
                  }}
                >
                  Delete Booking
                </button>
                <button
                  className="btn btn-secondary flex-1"
                  onClick={() => {
                    setShowDeleteBookingModal(false);
                    setBookingToDelete(null);
                    setDeleteBookingError('');
                    setDeleteBookingSuccess('');
                  }}
                >
                  Cancel
                </button>
              </div>
              {deleteBookingError && <div className="message error mt-2">{deleteBookingError}</div>}
              {deleteBookingSuccess && <div className="message success mt-2">{deleteBookingSuccess}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
