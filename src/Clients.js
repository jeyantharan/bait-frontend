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
      const res = await axios.get('https://backend-ruby-eight-64.vercel.app/api/bookings/clients/by-apartment', {
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
      const afterStart = !startDate || checkIn >= new Date(startDate);
      const beforeEnd = !endDate || checkIn <= new Date(endDate);
      return afterStart && beforeEnd;
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gradient-to-br from-blue-100 to-green-100 py-8">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-4xl text-center mb-10 border border-blue-300">
        <div className="flex justify-between items-center mb-4">
          <button
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors mr-2"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <h1 className="text-3xl font-extrabold text-blue-700">Clients by Appartmant</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <input
            type="text"
            placeholder="Search by client name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border px-4 py-2 rounded-full w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="border px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="border px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : groups.length === 0 ? (
          <div className="text-gray-500">No clients found.</div>
        ) : (
          <ul className="space-y-6">
            {groups.map(group => {
              const filtered = filterBookingsByDate(group.bookings);
              return (
                <li key={group._id.apartment + group._id.clientName} className="bg-gray-50 rounded-lg p-4 shadow border border-gray-200 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                    <span className="font-bold text-lg text-green-700">{group._id.clientName}</span>
                    <span className="text-sm text-gray-500">Area: {group._id.apartment}</span>
                    <span className="text-sm text-gray-500">Total Bookings: {group.totalBookings}</span>
                    <span className="text-sm text-gray-500">Last Booking: {group.lastBooking ? group.lastBooking.slice(0,10) : '-'}</span>
                    <span className="flex-1"></span>
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors text-xs ml-auto"
                      onClick={() => { setSelectedClient(group); setShowModal(true); }}
                    >
                      View Booking History
                    </button>
                  </div>
                  <div className="mt-2">
                    <span className="font-semibold text-blue-700">Bookings:</span>
                    <ul className="ml-4 mt-1 list-disc text-sm">
                      {filtered.length === 0 ? (
                        <li className="text-gray-400">No bookings in this date range.</li>
                      ) : filtered.map(b => (
                        <li key={b._id}>
                          {b.checkIn.slice(0,10)} to {b.checkOut.slice(0,10)} | Guests: {b.guests} | Price: ${b.price} | {b.paid ? 'Paid' : 'Not Paid'}
                          {b.specialNote && <span className="text-gray-400"> — {b.specialNote}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {showModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative">
            <button onClick={() => setShowModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
            <h3 className="text-2xl font-bold mb-4 text-green-700">{selectedClient._id.clientName} - {selectedClient._id.apartment}</h3>
            <div className="mb-2 text-sm text-gray-500">Total Bookings: {selectedClient.totalBookings}</div>
            <ul className="mt-2 max-h-60 overflow-y-auto">
              {filterBookingsByDate(selectedClient.bookings).map(b => (
                <li key={b._id} className="mb-2 p-2 border rounded text-sm bg-gray-50">
                  <div><span className="font-semibold">{b.clientName}</span> ({b.checkIn.slice(0,10)} to {b.checkOut.slice(0,10)})</div>
                  <div>Guests: {b.guests} | Price: ${b.price} | {b.paid ? 'Paid' : 'Not Paid'}</div>
                  <div className="text-xs text-gray-500">{b.specialNote}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clients; 
