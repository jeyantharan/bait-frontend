import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Clients() {
  const navigate = useNavigate();
  const query = useQuery();
  const initialSearch = query.get('search') || '';
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchGroups = async (searchTerm = '') => {
    setLoading(true);
    try {
      const res = await axios.get('https://backend-ruby-eight-64.vercel.app/api/clients', {
        params: { search: searchTerm }
      });
      setGroups(res.data);
    } catch {
      setGroups([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups(search);
    // eslint-disable-next-line
  }, [search]);

  useEffect(() => {
    setSearch(initialSearch);
    // eslint-disable-next-line
  }, [initialSearch]);

  // Filter bookings in each group by date range
  const filterBookingsByDate = (bookings) => {
    return bookings.filter(b => {
      const checkIn = new Date(b.checkIn);
      // Ensure date comparison ignores time component
      checkIn.setHours(0,0,0,0); 

      const start = startDate ? new Date(startDate) : null;
      if (start) start.setHours(0,0,0,0);

      const end = endDate ? new Date(endDate) : null;
      if (end) end.setHours(0,0,0,0);

      const afterStart = !start || checkIn >= start;
      const beforeEnd = !end || checkIn <= end;
      return afterStart && beforeEnd;
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-white text-black py-8 px-4">
      <div className="bg-black p-8 rounded-xl shadow-2xl w-full max-w-4xl text-center mb-8 border border-gray-800">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <button
            className="btn btn-yellow btn-sm"
            onClick={() => navigate(-1)}
          >
            Back to Home
          </button>
          <h1 className="text-3xl font-extrabold text-white flex-1 min-w-max text-center sm:text-left">👥 Client History</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <input
            type="text"
            placeholder="Search by client name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-control w-full sm:max-w-xs bg-gray-900 text-white placeholder-gray-500"
          />
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="form-control w-full sm:w-auto bg-gray-900 text-white"
          />
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="form-control w-full sm:w-auto bg-gray-900 text-white"
          />
        </div>
      </div> {/* End of header/search card */}

      <div className="card w-full max-w-4xl">
        {loading ? (
          <div className="text-gray-500 text-center py-8">Loading client data...</div>
        ) : groups.length === 0 ? (
          <div className="empty-state">
            <h3>No client history found.</h3>
            <p>Clients and their bookings will appear here.</p>
          </div>
        ) : (
          <ul className="space-y-6">
            {groups.map(group => {
              const filtered = filterBookingsByDate(group.bookings);
              return (
                <li key={group._id.apartment + group._id.clientName} className="apartment-item flex-col sm:flex-row items-start sm:items-center">
                  <div className="flex-1 w-full text-left">
                    <span className="font-bold text-xl text-black block mb-1">{group._id.clientName}</span>
                    <div className="text-sm text-gray-600 mb-2">
                        Apartment: <span className="font-medium text-black">{group._id.apartment}</span> | Total Bookings: <span className="font-medium text-black">{group.totalBookings}</span> | Last Booking: <span className="font-medium text-black">{group.lastBooking ? group.lastBooking.slice(0,10) : '-'}</span>
                    </div>
                    <div className="mt-2">
                      <span className="font-semibold text-black">Bookings in selected range:</span>
                      <ul className="ml-4 mt-1 list-disc text-sm space-y-1">
                        {filtered.length === 0 ? (
                          <li className="text-gray-500">No bookings in this date range.</li>
                        ) : filtered.map(b => (
                          <li key={b._id} className="text-gray-700">
                            <span className="font-medium">{b.checkIn.slice(0,10)}</span> to <span className="font-medium">{b.checkOut.slice(0,10)}</span> | Guests: {b.guests} | Price: <span className="font-medium">${b.price}</span> | {b.paid ? <span className="status-paid">Paid</span> : <span className="status-unpaid">Not Paid</span>}
                            {b.specialNote && <span className="text-gray-500 text-xs italic"> — {b.specialNote}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <button
                    className="btn btn-yellow btn-sm mt-4 sm:mt-0 sm:ml-4 flex-shrink-0"
                    onClick={() => { setSelectedClient(group); setShowModal(true); }}
                  >
                    View All Bookings
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {showModal && selectedClient && (
        <div className="modal-overlay">
          <div className="modal max-w-lg">
            <div className="modal-header">
              <div>
                <h3 className="text-2xl font-bold">{selectedClient._id.clientName}</h3>
                <p className="text-gray-400">Bookings for {selectedClient._id.apartment}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="close-btn">
                &times;
              </button>
            </div>
            <div className="modal-content">
              <div className="mb-4 text-sm text-gray-700">Total Bookings: <span className="font-semibold">{selectedClient.totalBookings}</span></div>
              <ul className="max-h-60 overflow-y-auto space-y-3 pr-2">
                {selectedClient.bookings.length === 0 ? (
                  <div className="empty-state text-sm py-4">
                    <p>No bookings found for this client.</p>
                  </div>
                ) : (
                  selectedClient.bookings.map(b => (
                    <li key={b._id} className="booking-item">
                      <div>
                        <div className="booking-name">{b.clientName}</div>
                        <div className="booking-details">
                          {b.checkIn.slice(0,10)} to {b.checkOut.slice(0,10)} | Guests: {b.guests}
                        </div>
                        <div className="booking-details">
                          Price: <span className="font-semibold">${b.price}</span> | Status: <span className={b.paid ? 'status-paid' : 'status-unpaid'}>{b.paid ? 'Paid' : 'Not Paid'}</span>
                        </div>
                        <div className="booking-details text-xs text-gray-500 mt-1">Note: {b.specialNote || 'N/A'}</div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clients;
