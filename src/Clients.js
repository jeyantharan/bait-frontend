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
  const apartmentId = query.get('apartmentId') || '';
  const apartmentName = query.get('apartmentName') || '';
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [phoneSearch, setPhoneSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Payment management state variables
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

  const fetchGroups = async (searchTerm = '', phoneSearchTerm = '') => {
    setLoading(true);
    try {
      const res = await axios.get('https://backend-dy1x692mj-jeys-projects-10abfd47.vercel.app/api/clients', {
        params: { 
          search: searchTerm,
          phoneSearch: phoneSearchTerm,
          apartmentId: apartmentId 
        }
      });

      setGroups(res.data);
    } catch (error) {
      console.error('API Error:', error);
      setGroups([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups(search, phoneSearch);
    // eslint-disable-next-line
  }, [search, phoneSearch, apartmentId]);

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

  // Helper to get Totale pagato for a booking
  function getTotalPaid(booking) {
    if (booking.payments && booking.payments.length > 0) {
      return booking.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    }
    return 0;
  }

  // Helper to get due for a booking
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

  // Helper function to format date as dd-mm-yyyy
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Group clients by apartment
  const groupByApartment = () => {
    const apartmentGroups = {};
    

    
    groups.forEach(group => {
      const apartmentName = group._id.apartment;
      const clientName = group._id.clientName;
      const phone = group._id.phone;
      // Get email from the first booking in the group
      const email = group.bookings && group.bookings.length > 0 ? group.bookings[0].email : null;
      
      console.log('Processing group:', { apartmentName, clientName, phone, email });
      
      if (!apartmentGroups[apartmentName]) {
        apartmentGroups[apartmentName] = [];
      }
      
      apartmentGroups[apartmentName].push({
        clientName,
        phone,
        email, // Store email directly
        totalBookings: group.totalBookings,
        lastBooking: group.lastBooking,
        bookings: group.bookings
      });
    });
    
    console.log('Apartment groups:', apartmentGroups);
    return apartmentGroups;
  };

  const apartmentGroups = groupByApartment();

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-white text-black py-8 px-4">
      <div className="bg-black p-8 rounded-xl shadow-2xl w-full max-w-6xl text-center mb-8 border border-gray-800">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <button
            className="btn btn-yellow btn-sm"
            onClick={() => navigate(-1)}
          >
            Back to Home
          </button>
          <h1 className="text-3xl font-extrabold text-white flex-1 min-w-max text-center sm:text-left">
            👥 Storico clienti - {apartmentName}
          </h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <input
            type="text"
            placeholder="Search by Nome cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-control w-full sm:max-w-xs bg-gray-900 text-white placeholder-gray-500"
          />
          <input
            type="text"
            placeholder="Search by Numero di telefono..."
            value={phoneSearch}
            onChange={e => setPhoneSearch(e.target.value)}
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

      <div className="w-full max-w-6xl">
        {loading ? (
          <div className="text-gray-500 text-center py-8">Loading client data...</div>
        ) : Object.keys(apartmentGroups).length === 0 ? (
          <div className="empty-state">
            <h3>No Storico clienti found for {apartmentName}.</h3>
            <p>Clients and their bookings will appear here.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(apartmentGroups).map(([apartmentName, clients]) => {
              // Filter clients who have bookings in the selected date range
              const clientsWithBookingsInRange = clients.filter(client => {
                const filtered = filterBookingsByDate(client.bookings);
                if (startDate || endDate) {
                  return filtered.length > 0;
                }
                return true; // Show all clients if no date filter is applied
              });

              // Don't show apartment if no clients have bookings in the date range
              if (clientsWithBookingsInRange.length === 0) {
                return null;
              }

              return (
                <div key={apartmentName} className="card">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-black border-b-2 border-yellow-400 pb-2">
                      🏢 {apartmentName}
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Totale clienti: {clientsWithBookingsInRange.length} | Totale prenotazioni: {clientsWithBookingsInRange.reduce((sum, client) => sum + client.totalBookings, 0)}
                    </p>
                  </div>
                
                <ul className="space-y-4">
                  {clientsWithBookingsInRange.map(client => {
                    const filtered = filterBookingsByDate(client.bookings);
                    return (
                      <li key={apartmentName + client.clientName} className="apartment-item flex-col sm:flex-row items-start sm:items-center bg-gray-50 rounded-lg p-4">
                        <div className="flex-1 w-full text-left">
                          <span className="font-bold text-xl text-black block mb-1">{client.clientName}</span>
                          <div className="text-sm text-gray-600 mb-2">
                              Phone: <span className="font-medium text-black">{client.phone || 'N/A'}</span> | Email: <span className="font-medium text-black">{client.email && client.email.trim() !== '' ? client.email : 'N/A'}</span> | Totale prenotazioni: <span className="font-medium text-black">{client.totalBookings}</span> | Last Booking: <span className="font-medium text-black">{client.lastBooking ? formatDate(client.lastBooking) : '-'}</span>
                          </div>
                          <div className="mt-2">
                            <span className="font-semibold text-black">Prenotazioni nell'intervallo selezionato:</span>
                            <ul className="ml-4 mt-1 list-disc text-sm space-y-1">
                              {filtered.length === 0 ? (
                                <li className="text-gray-500">No bookings in this date range.</li>
                              ) : filtered.map(b => (
                                <li key={b._id} className="text-gray-700">
                                  <span className="font-medium">{formatDate(b.checkIn)}</span> to <span className="font-medium">{formatDate(b.checkOut)}</span> | Guests: {b.guests} | Price: <span className="font-medium">€{b.price}</span> | Pagato: <span className="font-medium">€{getTotalPaid(b)}</span> | Mancano: <span className="font-medium">€{getDue(b)}</span> | {isBookingPaid(b) ? <span className="status-paid">Pagato</span> : <span className="status-unpaid">Non pagato</span>}
                                  {b.specialNote && <span className="text-gray-500 text-xs italic"> — {b.specialNote}</span>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <button
                          className="btn btn-yellow btn-sm mt-4 sm:mt-0 sm:ml-4 flex-shrink-0"
                          onClick={() => { 
                            setSelectedClient({
                              _id: { clientName: client.clientName, apartment: apartmentName, phone: client.phone, email: client.email || '' },
                              totalBookings: client.totalBookings,
                              bookings: client.bookings
                            }); 
                            setShowModal(true); 
                          }}
                        >
                          Vedi tutte le prenotazioni
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          }).filter(Boolean)} {/* Remove null entries */}
          </div>
        )}
      </div>

      {showModal && selectedClient && (
        <div className="modal-overlay">
          <div className="modal max-w-lg">
            <div className="modal-header">
              <div>
                <h3 className="text-2xl font-bold">{selectedClient._id.clientName}</h3>
                <p className="text-gray-400">Phone: {selectedClient._id.phone || 'N/A'} | Email: {selectedClient._id.email && selectedClient._id.email.trim() !== '' ? selectedClient._id.email : 'N/A'} | Bookings for {selectedClient._id.apartment}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="close-btn">
                &times;
              </button>
            </div>
            <div className="modal-content">
              <div className="mb-4 text-sm text-gray-700">Totale prenotazioni: <span className="font-semibold">{selectedClient.totalBookings}</span></div>
              <ul className="max-h-60 overflow-y-auto space-y-3 pr-2">
                {selectedClient.bookings.length === 0 ? (
                  <div className="empty-state text-sm py-4">
                    <p>Nessuna prenotazione trovata for this client.</p>
                  </div>
                ) : (
                  selectedClient.bookings.map(b => (
                    <li key={b._id} className="booking-item">
                      <div>
                        <div className="booking-name">{b.clientName}</div>
                        <div className="booking-details">
                                                        {formatDate(b.checkIn)} to {formatDate(b.checkOut)} | Guests: {b.guests}
                        </div>
                        <div className="booking-details">
                          Price: <span className="font-semibold">€{b.price}</span> | Paid: <span className="font-semibold">€{getTotalPaid(b)}</span> | Mancano: <span className="font-semibold">€{getDue(b)}</span> | Stato: <span className={isBookingPaid(b) ? 'status-paid' : 'status-unpaid'}>{isBookingPaid(b) ? 'Pagato' : 'Non pagato'}</span>
                        </div>
                        <div className="booking-details text-xs text-gray-500 mt-1">Special Note: {b.specialNote || 'N/A'}</div>
                        <div className="booking-details text-xs text-gray-500 mt-1">Note: {b.note || 'N/A'}</div>
                        <div className="mt-2 flex gap-2">
                          <button
                            className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-500 text-black px-2 py-1 rounded text-xs font-semibold shadow-sm transition-all duration-200 hover:shadow-md"
                            title="Record Payment"
                            onClick={() => {
                              setPaymentsBooking(b);
                              setPaymentHistory(b.payments || []);
                              setShowPaymentsModal(true);
                              setPaymentModalError('');
                              setPaymentModalSuccess('');
                              setIsEditingPayment(null);
                            }}
                          >
                            💵 Pagamento
                          </button>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Payment Management Modal */}
      {showPaymentsModal && paymentsBooking && (
        <div className="modal-overlay z-50">
          <div className="modal max-w-lg">
            <div className="modal-header flex justify-between items-center">
              <h3 className="text-xl font-bold">Pagamento for {paymentsBooking.clientName}</h3>
              <button onClick={() => setShowPaymentsModal(false)} className="close-btn">&times;</button>
            </div>
            <div className="modal-content">
              {/* Summary */}
              <div className="mb-4 p-2 bg-gray-50 rounded flex flex-wrap gap-4 text-sm">
                <div>Prezzo totale: <span className="font-semibold">€{paymentsBooking.price}</span></div>
                <div>Totale pagato: <span className="font-semibold">€{(paymentHistory.reduce((sum, p) => sum + Number(p.amount), 0)).toFixed(2)}</span></div>
                <div>Saldo dovuto: <span className="font-semibold">€{(paymentsBooking.price - paymentHistory.reduce((sum, p) => sum + Number(p.amount), 0)).toFixed(2)}</span></div>
                <div>Stato: {paymentHistory.reduce((sum, p) => sum + Number(p.amount), 0) >= paymentsBooking.price ? <span className="text-green-600 font-semibold">Pagato</span> : <span className="text-red-600 font-semibold">Non pagato</span>}</div>
              </div>
              {/* Payment History Table */}
              <div className="mb-4">
                <div className="font-semibold mb-2">Pagamento History</div>
                {paymentHistory.length === 0 ? (
                  <div className="text-xs text-gray-500">No Pagamento yet.</div>
                ) : (
                  <table className="w-full text-xs border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-1 border">Date</th>
                        <th className="p-1 border">Importo</th>
                        <th className="p-1 border">Metodo</th>
                        <th className="p-1 border">Note</th>
                        <th className="p-1 border">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((p, idx) => (
                        <tr key={p._id || idx}>
                          <td className="p-1 border">{p.date ? new Date(p.date).toLocaleDateString() : ''}</td>
                          <td className="p-1 border">€{p.amount}</td>
                          <td className="p-1 border">{p.method}</td>
                          <td className="p-1 border">{p.note}</td>
                          <td className="p-1 border">
                            {paymentHistory.length > 0 && (
                              <button className="text-blue-600 mr-1" onClick={() => {
                                setIsEditingPayment(p._id || idx);
                                setNewPayment({ date: p.date ? formatDate(p.date) : '', amount: p.amount, method: p.method, note: p.note });
                              }}>Modifica</button>
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
                <div className="font-semibold mb-1">{isEditingPayment ? 'Modifica pagamento' : 'Aggiungi pagamento'}</div>
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
                        const res = await axios.put('https://backend-dy1x692mj-jeys-projects-10abfd47.vercel.app/api/bookings/payments', {
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
                          await axios.put('https://backend-dy1x692mj-jeys-projects-10abfd47.vercel.app/api/bookings/paid', {
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
                        // Refresh client data
                        fetchGroups(search, phoneSearch);
                      } catch (err) {
                        setPaymentModalError(err.response?.data?.message || 'Failed to update payment');
                      }
                    } else {
                      // Add payment
                      try {
                        const res = await axios.post('https://backend-dy1x692mj-jeys-projects-10abfd47.vercel.app/api/bookings/payments', {
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
                          await axios.put('https://backend-dy1x692mj-jeys-projects-10abfd47.vercel.app/api/bookings/paid', {
                            bookingId: updated._id,
                            paid: isPaid
                          });
                        } catch (err) {
                          // Optionally log error, but don't block UI
                          console.error('Failed to update paid status:', err.response?.data?.message || err.message);
                        }
                        setPaymentModalSuccess('Pagamento added!');
                        setNewPayment({ date: '', amount: '', method: '', note: '' });
                        // Refresh client data
                        fetchGroups(search, phoneSearch);
                      } catch (err) {
                        setPaymentModalError(err.response?.data?.message || 'Failed to add Pagamento');
                      }
                    }
                  } catch (err) {
                    setPaymentModalError(err.message || 'Error saving Pagamento');
                  }
                }} className="flex flex-wrap gap-2 items-end">
                  <input type="date" className="input-field" value={newPayment.date} onChange={e => setNewPayment(f => ({ ...f, date: e.target.value }))} required />
                  <input type="number" className="input-field" placeholder="Importo" value={newPayment.amount} onChange={e => setNewPayment(f => ({ ...f, amount: e.target.value }))} required min="1" />
                  <input className="input-field" placeholder="Metodo" value={newPayment.method} onChange={e => setNewPayment(f => ({ ...f, method: e.target.value }))} required />
                  <input className="input-field" placeholder="Note" value={newPayment.note} onChange={e => setNewPayment(f => ({ ...f, note: e.target.value }))} />
                  <button type="submit" className="btn btn-primary btn-xs">{isEditingPayment ? 'Update' : 'Aggiungi'}</button>
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
    </div>
  );
}

export default Clients;
