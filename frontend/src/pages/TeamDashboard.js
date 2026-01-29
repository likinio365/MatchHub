// frontend/src/pages/TeamDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios'; 
import socket from '../api/socket'; 
import { toast } from 'react-toastify';
import DashboardNavbar from '../components/DashboardNavbar';

const TeamDashboard = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [allPendingRequests, setAllPendingRequests] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterFacility, setFilterFacility] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [allSlots, setAllSlots] = useState([]);
  const [takenSlots, setTakenSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [numPlayers, setNumPlayers] = useState(1);
  const [showPlayersListModal, setShowPlayersListModal] = useState(false);
  const [currentBookingPlayers, setCurrentBookingPlayers] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const fetchBookings = useCallback(async () => {
      try {
          const res = await api.get('/bookings/my-bookings');
          setMyBookings(res.data);
      } catch (e) {
          console.error("Fetch Bookings Error:", e);
      }
  }, []);

  const fetchRequests = useCallback(async () => {
      try {
          const res = await api.get('/matches/manager/all-requests');
          setAllPendingRequests(res.data);
      } catch (e) {
          console.error("Fetch Requests Error:", e);
      }
  }, []);

  const fetchInitialData = useCallback(async () => {
    try {
      const facRes = await api.get('/facilities/list');
      setFacilities(facRes.data);
      await fetchRequests();
    } catch (e) { 
      console.error("Initial Fetch Error:", e.message); 
    }
  }, [fetchRequests]);


  useEffect(() => {
      fetchInitialData();
  }, [fetchInitialData]);

 
  useEffect(() => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));

      const setupSocketRoom = () => {
          if (userInfo) {
              socket.emit("setup", userInfo);
          }
      };

      if (!socket.connected) {
          socket.connect();
      } else {
          setupSocketRoom();
      }

      socket.on('connect', setupSocketRoom);

      const handleNotification = (newNotif) => {
          if (newNotif.type === 'booking_status') {
              toast.info(`🔔 ${newNotif.message}`);
              fetchBookings();
          }
          if (newNotif.type === 'join_request') {
              toast.info(`🔔 ${newNotif.message}`);
              fetchRequests();
              fetchBookings();
          }
      };

      socket.on('new_notification', handleNotification);

      return () => {
          socket.off('connect', setupSocketRoom);
          socket.off('new_notification', handleNotification);
      };
  }, [fetchRequests, fetchBookings]);

 
  useEffect(() => {
    setLoading(true);
    const endpoint = activeTab === 'search' 
      ? `/fields?type=${filterType}&facility=${filterFacility}`
      : '/bookings/my-bookings';
    
    api.get(endpoint)
      .then(res => activeTab === 'search' ? setFields(res.data) : setMyBookings(res.data))
      .catch(err => console.error("Tab Fetch Error:", err.message))
      .finally(() => setLoading(false));
  }, [activeTab, filterType, filterFacility]);


  useEffect(() => {
    if (selectedField && selectedDate) {
      api.get(`/bookings/check-availability/${selectedField._id}/${selectedDate}`)
        .then(res => { 
            setAllSlots(res.data.allSlots); 
            setTakenSlots(res.data.takenSlots); 
        })
        .catch(err => console.error("Availability Error:", err.message));
    }
  }, [selectedField, selectedDate]);


  const handleCreateBooking = async () => {
    if (!selectedSlot) return toast.warn('Επιλέξτε ώρα!');
    try {
      await api.post('/bookings', { fieldId: selectedField._id, date: selectedDate, timeSlot: selectedSlot });
      toast.success('Το αίτημα στάλθηκε επιτυχώς!');
      setShowModal(false);
    } catch (e) { 
      toast.error(e.response?.data?.message || 'Σφάλμα κατά την κράτηση'); 
    }
  };

  const handleTogglePlayerSearch = async (id, isLooking) => {
    try {
      if (isLooking) {
        const { data } = await api.patch(`/bookings/${id}/players`, { playersNeeded: 0 });
        setMyBookings(myBookings.map(b => b._id === id ? data : b));
        toast.info("Η αναζήτηση παικτών σταμάτησε.");
      } else {
        setSelectedBookingId(id); 
        setNumPlayers(1); 
        setShowPlayersModal(true);
      }
    } catch (e) {
      toast.error("Σφάλμα ενημέρωσης αναζήτησης.");
    }
  };

  const confirmPlayerSearch = async () => {
    try {
      const { data } = await api.patch(`/bookings/${selectedBookingId}/players`, { playersNeeded: numPlayers });
      setMyBookings(myBookings.map(b => b._id === selectedBookingId ? data : b));
      setShowPlayersModal(false);
      toast.success('Η αναζήτηση παικτών ενεργοποιήθηκε!');
    } catch (e) {
      toast.error("Αποτυχία ενεργοποίησης.");
    }
  };

  const handleRequestAction = async (requestId, status) => {
    try {
      await api.put(`/matches/request/${requestId}`, { status });
      setAllPendingRequests(prev => prev.filter(r => r._id !== requestId));
      fetchBookings(); 
      toast.success(status === 'accepted' ? "Ο παίκτης έγινε δεκτός!" : "Το αίτημα απορρίφθηκε.");
    } catch (e) { 
      toast.error("Σφάλμα κατά την επεξεργασία του αιτήματος."); 
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return <span className="badge bg-success shadow-sm">Εγκρίθηκε</span>;
      case 'pending': return <span className="badge bg-warning text-dark shadow-sm">Εκκρεμεί</span>;
      case 'cancelled': return <span className="badge bg-danger shadow-sm">Ακυρώθηκε</span>;
      case 'completed': return <span className="badge bg-secondary shadow-sm">Ολοκληρώθηκε</span>;
      case 'rejected': return <span className="badge bg-danger shadow-sm">Απορρίφθηκε</span>;
      default: return <span className="badge bg-secondary shadow-sm">{status}</span>;
    }
  };

  const filteredBookings = showHistory 
    ? myBookings 
    : myBookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled' && b.status !== 'rejected');

  return (
    <>
      <DashboardNavbar />
      <div className="container mt-4 mb-5">
        <div className="d-flex justify-content-center mb-4">
          <div className="btn-group shadow-sm bg-white rounded p-1">
            <button className={`btn px-4 fw-bold border-0 rounded-start ${activeTab === 'search' ? 'btn-primary' : 'btn-light'}`} onClick={() => setActiveTab('search')}>Εύρεση Γηπέδου</button>
            <button className={`btn px-4 fw-bold border-0 rounded-end ${activeTab === 'my_bookings' ? 'btn-primary' : 'btn-light'}`} onClick={() => setActiveTab('my_bookings')}>Οι Κρατήσεις μου</button>
          </div>
        </div>

        {activeTab === 'search' ? (
          <>
            <div className="card shadow-sm border-0 mb-4 p-3 bg-white rounded-3">
              <div className="d-flex flex-wrap gap-3 align-items-center">
                <select className="form-select w-auto border-light-subtle shadow-none" value={filterFacility} onChange={e => setFilterFacility(e.target.value)}>
                  <option value="all">Όλες οι Εγκαταστάσεις</option>
                  {facilities.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                </select>
                <select className="form-select w-auto border-light-subtle shadow-none" value={filterType} onChange={e => setFilterType(e.target.value)}>
                  <option value="all">Όλοι οι Τύποι</option>
                  <option value="5x5">5x5</option><option value="8x8">8x8</option><option value="11x11">11x11</option>
                </select>
              </div>
            </div>

            <div className="row g-4">
              {fields.map(field => (
                <div className="col-md-4" key={field._id}>
                  <div className="card h-100 shadow-sm border-0 overflow-hidden rounded-4 hover-scale">
                    <img src={field.imageUrl || 'https://via.placeholder.com/400x200'} className="card-img-top" alt="" style={{height: 180, objectFit: 'cover'}}/>
                    <div className="card-body">
                      <h5 className="fw-bold mb-1 text-dark">{field.name} <span className="badge bg-dark float-end small">{field.type}</span></h5>
                      <p className="text-muted small mb-0"><i className="bi bi-geo-alt me-1"></i>{field.facility?.name}</p>
                      <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                        <span className="fw-bold text-success fs-5">
                            {field.pricePerHour}€
                            <small className="text-muted fw-normal" style={{fontSize: '0.7rem'}}>/ώρα</small>
                        </span>

                        <button className="btn btn-primary px-4 shadow-sm fw-bold rounded-pill" onClick={() => { setSelectedField(field); setShowModal(true); }}>Κράτηση</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {!loading && fields.length === 0 && <div className="text-center py-5 text-muted"><h5>Δεν βρέθηκαν διαθέσιμα γήπεδα.</h5></div>}
            </div>
          </>
        ) : (
          <>
            {allPendingRequests.length > 0 && (
              <div className="card shadow-sm border-0 mb-4 bg-primary-subtle border-start border-4 border-primary rounded-3 overflow-hidden fade-in">
                <div className="card-header bg-transparent py-3 fw-bold text-primary"><i className="bi bi-bell-fill me-2"></i>Νέα Αιτήματα Παικτών ({allPendingRequests.length})</div>
                <div className="list-group list-group-flush">
                  {allPendingRequests.map(req => (
                    <div key={req._id} className="list-group-item d-flex justify-content-between align-items-center bg-transparent py-3 border-bottom-0">
                      <div>
                        <span className="fw-bold">{req.player?.firstName} {req.player?.lastName}</span>
                        <span className="text-muted small mx-2">για τον αγώνα</span>
                        <span className="badge bg-white text-dark border-0 shadow-none">{req.booking?.field?.name}</span>
                        <div className="small text-muted mt-1">{req.booking?.date} @ {req.booking?.timeSlot}</div>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-success btn-sm px-3 shadow-sm rounded-pill" onClick={() => handleRequestAction(req._id, 'accepted')}><i className="bi bi-check-lg"></i></button>
                        <button className="btn btn-outline-danger btn-sm px-3 shadow-sm rounded-pill" onClick={() => handleRequestAction(req._id, 'rejected')}><i className="bi bi-x-lg"></i></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="card shadow-sm border-0 bg-white rounded-4 overflow-hidden">
              <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold text-primary"><i className="bi bi-calendar-check me-2"></i>Οι Κρατήσεις μου</h5>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="historySwitch" checked={showHistory} onChange={(e) => setShowHistory(e.target.checked)} style={{ cursor: 'pointer' }} />
                    <label className="form-check-label small fw-bold text-muted" htmlFor="historySwitch" style={{ cursor: 'pointer' }}>Προβολή Ιστορικού</label>
                  </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 text-center">
                  <thead className="table-light text-uppercase small fw-bold">
                    <tr><th className="py-3">Ημερομηνία & Ώρα</th><th className="py-3">Γήπεδο</th><th className="py-3">Κατάσταση</th><th className="py-3">Δράσεις Παικτών</th></tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map(b => (
                      <tr key={b._id}>
                        <td className="py-3"><div className="fw-bold text-dark">{b.date}</div><small className="text-primary fw-bold">{b.timeSlot}</small></td>
                        <td className="py-3"><div className="fw-bold">{b.field?.name}</div><small className="text-muted">{b.facility?.name}</small></td>
                        <td className="py-3">{getStatusBadge(b.status)}</td>
                        <td className="py-3">
                          {b.status === 'confirmed' && (
                            <div className="d-flex flex-column gap-2 align-items-center">
                              <button className={`btn btn-sm shadow-sm fw-bold rounded-pill px-3 ${b.lookingForPlayers ? 'btn-warning' : 'btn-outline-primary'}`} onClick={() => handleTogglePlayerSearch(b._id, b.lookingForPlayers)}>
                                {b.lookingForPlayers ? <><i className="bi bi-search me-1"></i>Ψάχνω {b.playersNeeded}</> : "Βρες Παίκτες"}
                              </button>
                              
                              {b.joinedPlayers?.length > 0 && (
                                <button className="btn btn-link btn-sm text-success text-decoration-none fw-bold p-0" 
                                        onClick={() => { setCurrentBookingPlayers(b.joinedPlayers); setShowPlayersListModal(true); }}>
                                  <i className="bi bi-people-fill me-1"></i> Λίστα ({b.joinedPlayers.length})
                                </button>
                              )}
                            </div>
                          )}
                          {b.status === 'completed' && <span className="text-muted small fst-italic">Το παιχνίδι έληξε</span>}
                          {b.status === 'pending' && <span className="text-muted small">Αναμονή έγκρισης</span>}
                          {b.status === 'cancelled' && <span className="text-danger small text-decoration-line-through">Ακυρώθηκε</span>}
                          {b.status === 'rejected' && <span className="text-danger small fw-bold">Απορρίφθηκε</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!loading && filteredBookings.length === 0 && <div className="text-center py-5 text-muted"><h5>Δεν υπάρχουν δεδομένα.</h5></div>}
              </div>
            </div>
          </>
        )}
        {showPlayersListModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header bg-success text-white border-0 py-3">
                  <h6 className="modal-title fw-bold"><i className="bi bi-people-fill me-2"></i>Παίκτες που θα έρθουν</h6>
                  <button className="btn-close btn-close-white shadow-none" onClick={() => setShowPlayersListModal(false)}></button>
                </div>
                <div className="modal-body p-0">
                  <div className="list-group list-group-flush">
                    {currentBookingPlayers.map((p, idx) => (
                      <div key={idx} className="list-group-item d-flex justify-content-between align-items-center py-3">
                        <div>
                          <div className="fw-bold text-dark">{p.firstName} {p.lastName}</div>
                          <div className="small text-muted"><i className="bi bi-telephone me-1"></i>{p.phone}</div>
                        </div>
                        <a href={`tel:${p.phone}`} className="btn btn-success btn-sm rounded-circle p-2 shadow-sm d-flex align-items-center justify-content-center" style={{width: 35, height: 35}}><i className="bi bi-telephone-fill" style={{fontSize: '0.8rem'}}></i></a>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="modal-footer border-0 p-3"><button className="btn btn-secondary w-100 fw-bold rounded-pill py-2" onClick={() => setShowPlayersListModal(false)}>Κλείσιμο</button></div>
              </div>
            </div>
          </div>
        )}
        {showModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered text-center">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header bg-primary text-white py-3 border-0">
                    <h6 className="modal-title fw-bold">Κράτηση: {selectedField?.name}</h6>
                    <button className="btn-close btn-close-white shadow-none" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <label className="form-label small fw-bold text-muted text-uppercase mb-2">Επιλέξτε Ημερομηνία</label>
                  <input type="date" className="form-control mb-4 fw-bold rounded-3" value={selectedDate} min={new Date().toISOString().split('T')[0]} onChange={e => setSelectedDate(e.target.value)} />
                  <label className="form-label small fw-bold text-muted text-uppercase mb-3">Διαθέσιμα Slots</label>
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    {allSlots.map(s => (
                      <button key={s} disabled={takenSlots.includes(s)} className={`btn btn-sm rounded-3 fw-bold ${selectedSlot === s ? 'btn-success' : 'btn-outline-dark'} ${takenSlots.includes(s) ? 'opacity-25' : ''}`} onClick={() => setSelectedSlot(s)} style={{width:85, height:40}}>{s}</button>
                    ))}
                  </div>
                </div>
                <div className="modal-footer border-0 p-0"><button className="btn btn-primary w-100 rounded-0 py-3 fw-bold text-uppercase ls-1" onClick={handleCreateBooking} disabled={!selectedSlot}>Ολοκληρωση Αιτηματος</button></div>
              </div>
            </div>
          </div>
        )}
        {showPlayersModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
            <div className="modal-dialog modal-sm modal-dialog-centered text-center">
              <div className="modal-content border-0 p-4 shadow-lg rounded-4">
                <h6 className="fw-bold mb-3 text-uppercase small text-muted">Πόσους παίκτες ψάχνετε;</h6>
                <div className="d-flex justify-content-center align-items-center gap-4 mb-4">
                  <button className="btn btn-light shadow-sm rounded-circle fs-3 d-flex align-items-center justify-content-center" onClick={() => setNumPlayers(Math.max(1, numPlayers - 1))} style={{width:50, height:50}}>-</button>
                  <span className="fs-1 fw-bold text-primary">{numPlayers}</span>
                  <button className="btn btn-light shadow-sm rounded-circle fs-3 d-flex align-items-center justify-content-center" onClick={() => setNumPlayers(numPlayers + 1)} style={{width:50, height:50}}>+</button>
                </div>
                <button className="btn btn-primary w-100 fw-bold py-3 rounded-pill shadow" onClick={confirmPlayerSearch}>ΕΝΕΡΓΟΠΟΙΗΣΗ</button>
                <button className="btn btn-link text-muted text-decoration-none mt-2 small" onClick={() => setShowPlayersModal(false)}>Ακύρωση</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx="true">{`
        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .hover-scale { transition: transform 0.2s; }
        .hover-scale:hover { transform: scale(1.02); }
      `}</style>
    </>
  );
};

export default TeamDashboard;