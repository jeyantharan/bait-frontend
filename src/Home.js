import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Keep default calendar styles for base, then override

function Home() {
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
    bookingDate: '',
    checkIn: '',
    checkOut: '',
    price: '',
    advance: '',
    paymentMethod: '',
    paid: false,
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
  const BOOKINGS_PER_PAGE = 3;
  const [selectedDateBookings, setSelectedDateBookings] = useState([]);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [showRangeWarning, setShowRangeWarning] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');

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
        .then(res => setBookings(res.data))
        .catch(() => setBookings([]));
    }
  }, [selectedApartment, showModal]);

  const handleLogout = () => {
    localStorage.removeItem('token');
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
  const filteredBookings = bookings.filter(b => b.clientName.toLowerCase().includes(bookingSearch.toLowerCase()));
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
    printWindow.document.write(`<div><strong>Booking Date:</strong> ${booking.bookingDate ? booking.bookingDate.slice(0,10) : ''}</div>`);
    printWindow.document.write(`<div><strong>Check In:</strong> ${booking.checkIn.slice(0,10)}</div>`);
    printWindow.document.write(`<div><strong>Check Out:</strong> ${booking.checkOut.slice(0,10)}</div>`);
    printWindow.document.write(`<div><strong>Guests:</strong> ${booking.guests}</div>`);
    printWindow.document.write(`<div><strong>Price:</strong> $${booking.price}</div>`);
    printWindow.document.write(`<div><strong>Advance:</strong> $${booking.advance || 0}</div>`);
    printWindow.document.write(`<div><strong>Due:</strong> $${booking.price - (booking.advance || 0)}</div>`);
    printWindow.document.write(`<div><strong>Payment Method:</strong> ${booking.paymentMethod}</div>`);
    printWindow.document.write(`<div><strong>Status:</strong> ${booking.paid ? 'Paid' : 'Not Paid'}</div>`);
    printWindow.document.write(`<div><strong>Special Note:</strong> ${booking.specialNote || 'N/A'}</div>`);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Helper to get all dates in a range
  function getDatesInRange(start, end) {
    const date = new Date(start);
    const dates = [];
    while (date <= end) {
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
    const allDates = getDatesInRange(checkInDate, checkOutDate);
    bookings.forEach(b => {
      const bStart = new Date(b.checkIn);
      const bEnd = new Date(b.checkOut);
      let d = new Date(bStart);
      while (d <= bEnd) {
        const key = d.toISOString().slice(0,10);
        bookedDateInfo[key] = b.clientName;
        d.setDate(d.getDate() + 1);
      }
    });
    bookedDatesInRange = allDates.filter(d => bookedDateInfo[d.toISOString().slice(0,10)]);
    freeDatesInRange = allDates.filter(d => !bookedDateInfo[d.toISOString().slice(0,10)]);
    hasBookedDates = bookedDatesInRange.length > 0;
  }


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
            <button
              onClick={handleLogout}
              className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-all duration-300 transform hover:-translate-y-px shadow-md"
            >
              Logout
            </button>
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
            <input
              type="text"
              placeholder="Search apartments..."
              value={search}
              onChange={handleSearch}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full sm:w-72 text-black bg-white"
            />
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
                  <button
                    className="btn btn-yellow btn-sm"
                    onClick={() => { setSelectedApartment(apt); setShowModal(true); }}
                  >
                    View Details
                  </button>
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

              {/* Action Buttons (Client History & Close) */}
              <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 sm:mt-0"> {/* Adjusted margin-top */}
                <button
                  className="btn btn-yellow w-full sm:w-auto" // Full width on mobile, auto on sm+
                  onClick={() => {
                    setShowModal(false);
                    navigate('/clients');
                  }}
                >
                  View Client History
                </button>
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
                    const requiredFields = ['clientName', 'phone', 'bookingDate', 'checkIn', 'checkOut', 'price', 'advance', 'paymentMethod', 'guests'];
                    const missingFields = requiredFields.filter(field => !bookingForm[field]);

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
                          ...bookingForm,
                          apartment: selectedApartment._id,
                          price: Number(bookingForm.price),
                          advance: Number(bookingForm.advance) || 0,
                          paid: Boolean(bookingForm.paid),
                          guests: Number(bookingForm.guests)
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
                          paid: Boolean(bookingForm.paid),
                          guests: Number(bookingForm.guests)
                        });
                        setBookingSuccess('Booking created successfully!');
                      }
                      setBookingForm({
                        clientName: '', phone: '', bookingDate: '', checkIn: '', checkOut: '', price: '', advance: '', paymentMethod: '', paid: false, specialNote: '', guests: ''
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
                      pattern="[0-9+\-() ]*"
                      maxLength={20}
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
                    <input 
                      type="date" 
                      className="input-field" 
                      value={bookingForm.checkIn} 
                      onChange={e => setBookingForm(f => ({ ...f, checkIn: e.target.value }))} 
                    />
                  </div>
                  <div className="form-group vertical">
                    <label className="input-label">Check Out</label>
                    <input 
                      type="date" 
                      className="input-field" 
                      value={bookingForm.checkOut} 
                      onChange={e => setBookingForm(f => ({ ...f, checkOut: e.target.value }))} 
                    />
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
                                        <div className="text-xs text-gray-700">Check-in: {booking?.checkIn?.slice(0,10)} | Check-out: {booking?.checkOut?.slice(0,10)}</div>
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
                                  <li key={d.toISOString()}>{d.toISOString().slice(0,10)}</li>
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
                    <label className="input-label">Payment Method</label>
                    <input 
                      className="input-field" 
                      value={bookingForm.paymentMethod} 
                      onChange={e => setBookingForm(f => ({ ...f, paymentMethod: e.target.value }))} 
                      placeholder="e.g., Cash, Card, Bank Transfer"
                    />
                  </div>
                  <div className="form-group vertical">
                    <label className="input-label">Paid Status</label>
                    <select 
                      className="input-field" 
                      value={bookingForm.paid} 
                      onChange={e => setBookingForm(f => ({ ...f, paid: e.target.value === 'true' }))}
                    >
                      <option value={false}>Not Paid</option>
                      <option value={true}>Paid</option>
                    </select>
                  </div>
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
                      <button type="button" className="btn btn-secondary flex-1" onClick={() => { setEditingBooking(null); setBookingForm({ clientName: '', phone: '', bookingDate: '', checkIn: '', checkOut: '', price: '', advance: '', paymentMethod: '', paid: false, specialNote: '', guests: '' }); }}>
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
                          const checkIn = new Date(b.checkIn);
                          const checkOut = new Date(b.checkOut);
                          checkIn.setHours(0,0,0,0);
                          checkOut.setHours(0,0,0,0);
                          return clicked >= checkIn && clicked <= checkOut;
                        });
                        setSelectedDateBookings(bookingsForDate);
                        setShowDateModal(true);
                      }}
                      tileContent={({ date, view }) => {
                        if (view === 'month') {
                          const foundBookings = bookings.filter(b => {
                            const checkIn = new Date(b.checkIn);
                            const checkOut = new Date(b.checkOut);
                            // Set hours to 0 to compare dates only
                            checkIn.setHours(0,0,0,0);
                            checkOut.setHours(0,0,0,0);
                            date.setHours(0,0,0,0);
                            return date >= checkIn && date <= checkOut;
                          });
                          return foundBookings.length > 0 ? (
                            <div
                              className="flex justify-center mt-1 relative"
                              onMouseEnter={() => { setHoveredDate(date); setHoveredBooking(foundBookings); }}
                              onMouseLeave={() => { setHoveredDate(null); setHoveredBooking(null); }}
                            >
                              <span className="inline-block w-2 h-2 rounded-full bg-yellow-400"></span>
                              {hoveredDate && date.toDateString() === hoveredDate.toDateString() && hoveredBooking && (
                                <div className="absolute z-50 left-1/2 -translate-x-1/2 top-6 bg-white border border-gray-300 rounded shadow-lg p-2 text-xs min-w-[200px] max-h-40 overflow-y-auto text-black">
                                  {hoveredBooking.map((hb, index) => (
                                    <div key={index} className="mb-1 pb-1 border-b last:border-b-0 border-gray-200">
                                      <div><span className="font-semibold">{hb.clientName}</span></div>
                                      <div>Check-in: {hb.checkIn.slice(0,10)}</div>
                                      <div>Check-out: {hb.checkOut.slice(0,10)}</div>
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
                    <ul className="mt-2 max-h-60 overflow-y-auto space-y-3 pr-2">
                      {paginatedBookings.map(b => (
                        <li key={b._id} className="booking-item flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="booking-info">
                            <div className="booking-name">{b.clientName}</div>
                            <div className="booking-details">
                              {b.checkIn.slice(0,10)} to {b.checkOut.slice(0,10)} | Guests: {b.guests}
                            </div>
                            <div className="booking-details">
                              Price: <span className="font-semibold">${b.price}</span> | Advance: <span className="font-semibold">${b.advance || 0}</span> | Due: <span className="font-semibold">${(b.price - (b.advance || 0))}</span> | Status: <span className={b.paid ? 'status-paid' : 'status-unpaid'}>{b.paid ? 'Paid' : 'Not Paid'}</span>
                            </div>
                            <div className="booking-details text-xs text-gray-500 mt-1">Note: {b.specialNote || 'N/A'}</div>
                          </div>
                          <div className="booking-actions flex flex-col gap-1">
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => printBooking(b)}
                            >
                              Print
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setEditingBooking(b._id);
                                setBookingForm({
                                  clientName: b.clientName,
                                  phone: b.phone || '',
                                  bookingDate: b.bookingDate ? b.bookingDate.slice(0,10) : '',
                                  checkIn: b.checkIn ? b.checkIn.slice(0,10) : '',
                                  checkOut: b.checkOut ? b.checkOut.slice(0,10) : '',
                                  price: b.price,
                                  advance: b.advance || '',
                                  paymentMethod: b.paymentMethod,
                                  paid: b.paid,
                                  specialNote: b.specialNote,
                                  guests: b.guests
                                });
                              }}
                            >
                              Edit
                            </button>
                            {!b.paid && (
                              <button
                                className="btn btn-yellow btn-sm font-semibold"
                                onClick={() => {
                                  setPaymentBooking(b);
                                  setPaymentAmount('');
                                  setPaymentError('');
                                  setPaymentSuccess('');
                                  setShowPaymentModal(true);
                                }}
                              >
                                Record Payment
                              </button>
                            )}
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
                <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {selectedDateBookings.map((b, idx) => (
                    <li key={b._id || idx} className="booking-item">
                      <div className="booking-name font-semibold">{b.clientName}</div>
                      <div className="booking-details text-sm">{b.checkIn.slice(0,10)} to {b.checkOut.slice(0,10)} | Guests: {b.guests}</div>
                      <div className="booking-details text-sm">Price: ${b.price} | Advance: ${b.advance || 0} | Due: ${b.price - (b.advance || 0)}</div>
                      <div className="booking-details text-xs text-gray-500 mt-1">Note: {b.specialNote || 'N/A'}</div>
                      <div className="booking-details text-xs">Status: <span className={b.paid ? 'status-paid' : 'status-unpaid'}>{b.paid ? 'Paid' : 'Not Paid'}</span></div>
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
              <div className="mb-2 text-gray-700">Booking for <span className="font-semibold">{paymentBooking.clientName}</span> ({paymentBooking.checkIn.slice(0,10)} to {paymentBooking.checkOut.slice(0,10)})</div>
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
    </div>
  );
}

export default Home;
