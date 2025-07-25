import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

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
    bookingDate: '',
    checkIn: '',
    checkOut: '',
    price: '',
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

  return (
    <div className="w-screen h-screen min-h-screen min-w-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-200 to-blue-200 py-8 overflow-auto">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg text-center mb-10 border border-green-300">
        <h1 className="text-4xl font-extrabold mb-2 text-green-700">🏢 Apartment Manager</h1>
        <p className="text-lg mb-6 text-gray-600">Welcome Home! You are logged in.</p>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition-colors mb-6 shadow"
        >
          Logout
        </button>
        <form onSubmit={handleCreate} className="mt-4 flex flex-col items-center gap-2">
          <input
            type="text"
            placeholder="Apartment Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-2 border-green-300 px-4 py-2 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors w-full shadow">Create Apartment</button>
        </form>
        {error && <div className="text-red-500 mt-2 text-sm font-semibold">{error}</div>}
        {success && <div className="text-green-600 mt-2 text-sm font-semibold">{success}</div>}
      </div>
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-blue-200">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-2">
          <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">Apartment List <span className="text-base text-gray-400">({total})</span></h2>
          <input
            type="text"
            placeholder="Search apartments..."
            value={search}
            onChange={handleSearch}
            className="border px-3 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-60"
          />
        </div>
        {apartments.length === 0 ? (
          <p className="text-gray-500">No apartments found.</p>
        ) : (
          <ul className="space-y-4">
            {apartments.map((apt) => (
              <li key={apt._id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 shadow-sm border border-gray-200">
                <span className="font-medium text-gray-800 text-lg">{apt.name}</span>
                <button
                  className="bg-green-500 text-white px-4 py-1 rounded-full hover:bg-green-600 transition-colors text-sm font-semibold shadow"
                  onClick={() => { setSelectedApartment(apt); setShowModal(true); }}
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        )}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="font-semibold">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
      {showModal && selectedApartment && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl relative overflow-y-auto max-h-screen">
            <button onClick={() => setShowModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-green-700">{selectedApartment.name}</h3>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors text-sm ml-4"
                onClick={() => {
                  setShowModal(false);
                  navigate('/clients');
                }}
              >
                View Client History
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
              <form
                className="flex-1 flex flex-col gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBookingError('');
                  setBookingSuccess('');
                  if (!bookingForm.clientName || !bookingForm.bookingDate || !bookingForm.checkIn || !bookingForm.checkOut || !bookingForm.price || !bookingForm.paymentMethod || !bookingForm.guests) {
                    setBookingError('All fields except special note are required.');
                    return;
                  }
                  try {
                    if (editingBooking) {
                      await axios.put('https://backend-ruby-eight-64.vercel.app/api/bookings', {
                        ...bookingForm,
                        apartment: selectedApartment._id,
                        price: Number(bookingForm.price),
                        paid: Boolean(bookingForm.paid),
                        guests: Number(bookingForm.guests)
                      }, {
                        params: { id: editingBooking }
                      });
                      setBookingSuccess('Booking updated!');
                      setEditingBooking(null);
                    } else {
                      await axios.post('https://backend-ruby-eight-64.vercel.app/api/bookings', {
                        ...bookingForm,
                        apartment: selectedApartment._id,
                        price: Number(bookingForm.price),
                        paid: Boolean(bookingForm.paid),
                        guests: Number(bookingForm.guests)
                      });
                      setBookingSuccess('Booking created!');
                    }
                    setBookingForm({
                      clientName: '', bookingDate: '', checkIn: '', checkOut: '', price: '', paymentMethod: '', paid: false, specialNote: '', guests: ''
                    });
                    // Refresh bookings
                    const res = await axios.get('https://backend-ruby-eight-64.vercel.app/api/bookings', {
                      params: { apartmentId: selectedApartment._id }
                    });
                    setBookings(res.data);
                  } catch {
                    setBookingError('Failed to save booking');
                  }
                }}
              >
                <label className="font-semibold">Client Name</label>
                <input className="border px-3 py-2 rounded" value={bookingForm.clientName} onChange={e => setBookingForm(f => ({ ...f, clientName: e.target.value }))} />
                <label className="font-semibold">Booking Date</label>
                <input type="date" className="border px-3 py-2 rounded" value={bookingForm.bookingDate} onChange={e => setBookingForm(f => ({ ...f, bookingDate: e.target.value }))} />
                <label className="font-semibold">Check In</label>
                <input type="date" className="border px-3 py-2 rounded" value={bookingForm.checkIn} onChange={e => setBookingForm(f => ({ ...f, checkIn: e.target.value }))} />
                <label className="font-semibold">Check Out</label>
                <input type="date" className="border px-3 py-2 rounded" value={bookingForm.checkOut} onChange={e => setBookingForm(f => ({ ...f, checkOut: e.target.value }))} />
                <label className="font-semibold">Price</label>
                <input type="number" className="border px-3 py-2 rounded" value={bookingForm.price} onChange={e => setBookingForm(f => ({ ...f, price: e.target.value }))} />
                <label className="font-semibold">Payment Method</label>
                <input className="border px-3 py-2 rounded" value={bookingForm.paymentMethod} onChange={e => setBookingForm(f => ({ ...f, paymentMethod: e.target.value }))} />
                <label className="font-semibold">Paid</label>
                <select className="border px-3 py-2 rounded" value={bookingForm.paid} onChange={e => setBookingForm(f => ({ ...f, paid: e.target.value === 'true' }))}>
                  <option value={false}>Not Paid</option>
                  <option value={true}>Paid</option>
                </select>
                <label className="font-semibold">Number of Guests</label>
                <input type="number" min="1" className="border px-3 py-2 rounded" value={bookingForm.guests} onChange={e => setBookingForm(f => ({ ...f, guests: e.target.value }))} />
                <label className="font-semibold">Special Note</label>
                <textarea className="border px-3 py-2 rounded" value={bookingForm.specialNote} onChange={e => setBookingForm(f => ({ ...f, specialNote: e.target.value }))} />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mt-2">{editingBooking ? 'Update Booking' : 'Add Booking'}</button>
                {editingBooking && (
                  <button type="button" className="bg-gray-300 text-gray-800 px-4 py-2 rounded mt-2 ml-2" onClick={() => { setEditingBooking(null); setBookingForm({ clientName: '', bookingDate: '', checkIn: '', checkOut: '', price: '', paymentMethod: '', paid: false, specialNote: '', guests: '' }); }}>Cancel Edit</button>
                )}
                {bookingError && <div className="text-red-500 text-sm mt-1">{bookingError}</div>}
                {bookingSuccess && <div className="text-green-600 text-sm mt-1">{bookingSuccess}</div>}
              </form>
              <div className="flex-1">
                <label className="font-semibold block mb-2">Bookings Calendar</label>
                <Calendar
                  value={calendarDate}
                  onChange={setCalendarDate}
                  tileContent={({ date, view }) => {
                    if (view === 'month') {
                      const found = bookings.find(b => {
                        const checkIn = new Date(b.checkIn);
                        const checkOut = new Date(b.checkOut);
                        return date >= checkIn && date <= checkOut;
                      });
                      return found ? (
                        <div
                          className="flex justify-center mt-1 relative"
                          onMouseEnter={() => { setHoveredDate(date); setHoveredBooking(found); }}
                          onMouseLeave={() => { setHoveredDate(null); setHoveredBooking(null); }}
                        >
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                          {hoveredDate && hoveredBooking && date.toDateString() === new Date(hoveredDate).toDateString() && (
                            <div className="absolute z-50 left-1/2 -translate-x-1/2 top-6 bg-white border border-gray-300 rounded shadow-lg p-2 text-xs min-w-[180px]">
                              <div><span className="font-semibold">{hoveredBooking.clientName}</span></div>
                              <div>Check-in: {hoveredBooking.checkIn.slice(0,10)}</div>
                              <div>Check-out: {hoveredBooking.checkOut.slice(0,10)}</div>
                              <div>Guests: {hoveredBooking.guests}</div>
                              <div>Price: ${hoveredBooking.price}</div>
                              <div>{hoveredBooking.paid ? 'Paid' : 'Not Paid'}</div>
                              <div className="text-gray-500">{hoveredBooking.specialNote}</div>
                            </div>
                          )}
                        </div>
                      ) : null;
                    }
                  }}
                />
                <div className="flex items-center gap-2 mt-4 mb-2">
                  <input
                    type="text"
                    placeholder="Search by client name..."
                    value={bookingSearch}
                    onChange={e => { setBookingSearch(e.target.value); setBookingPage(1); }}
                    className="border px-2 py-1 rounded text-sm"
                  />
                </div>
                <ul className="mt-2 max-h-40 overflow-y-auto">
                  {paginatedBookings.map(b => (
                    <li key={b._id} className="mb-2 p-2 border rounded text-sm bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <div><span className="font-semibold">{b.clientName}</span> ({b.checkIn.slice(0,10)} to {b.checkOut.slice(0,10)})</div>
                        <div>Price: ${b.price} | {b.paid ? 'Paid' : 'Not Paid'} | Guests: {b.guests}</div>
                        <div className="text-xs text-gray-500">{b.specialNote}</div>
                      </div>
                      <button
                        className="mt-1 text-blue-600 hover:underline text-xs"
                        onClick={() => {
                          setEditingBooking(b._id);
                          setBookingForm({
                            clientName: b.clientName,
                            bookingDate: b.bookingDate ? b.bookingDate.slice(0,10) : '',
                            checkIn: b.checkIn ? b.checkIn.slice(0,10) : '',
                            checkOut: b.checkOut ? b.checkOut.slice(0,10) : '',
                            price: b.price,
                            paymentMethod: b.paymentMethod,
                            paid: b.paid,
                            specialNote: b.specialNote,
                            guests: b.guests
                          });
                        }}
                      >Edit</button>
                    </li>
                  ))}
                </ul>
                {totalBookingPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-2">
                    <button
                      onClick={() => setBookingPage(bookingPage - 1)}
                      disabled={bookingPage === 1}
                      className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-xs"
                    >Prev</button>
                    <span className="font-semibold text-xs">Page {bookingPage} of {totalBookingPages}</span>
                    <button
                      onClick={() => setBookingPage(bookingPage + 1)}
                      disabled={bookingPage === totalBookingPages}
                      className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-xs"
                    >Next</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
