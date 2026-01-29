import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios'; 
import socket from '../api/socket'; 
import { toast } from 'react-toastify';
import DashboardNavbar from '../components/DashboardNavbar';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('finder'); 
  const [requestView, setRequestView] = useState('active');
  const [matches, setMatches] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [facilities, setFacilities] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterFacility, setFilterFacility] = useState('all');

  const fetchMatches = useCallback(async () => {
    try {
      const { data } = await api.get(`/matches/open-matches?type=${filterType}&facility=${filterFacility}`);
      setMatches(data);
      
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  }, [filterType, filterFacility]);

  const fetchMyRequests = useCallback(async () => {
    try {
      const { data } = await api.get('/matches/my-requests');
      setMyRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  }, []);

  const fetchFacilities = async () => {
    try {
      const { data } = await api.get('/facilities/list');
      setFacilities(data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    const init = async () => {
        setLoading(true);
        await Promise.all([fetchFacilities(), fetchMatches(), fetchMyRequests()]);
        setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    if (activeTab === 'finder') {
        fetchMatches(); 
    }
    if (activeTab === 'my_requests') {
        fetchMyRequests();
    }
  }, [activeTab, fetchMatches, fetchMyRequests]);


  useEffect(() => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));

      if (!socket.connected) socket.connect();
      if (userInfo) socket.emit("setup", userInfo);

      const handleMatchUpdate = (data) => {
          
          if (activeTab === 'finder') fetchMatches();
      };

      const handleNotification = (newNotif) => {
          if (newNotif.type === 'REQUEST_ACCEPTED' || newNotif.type === 'REQUEST_REJECTED') {
              toast.info(`🔔 ${newNotif.message}`);
              fetchMyRequests();
              fetchMatches();
          }
      };

      socket.on('refresh_matches', handleMatchUpdate);
      socket.on('new_notification', handleNotification);

      return () => {
          socket.off('refresh_matches', handleMatchUpdate);
          socket.off('new_notification', handleNotification);
      };
  }, [fetchMatches, fetchMyRequests, activeTab]);


  const handleJoin = async (bookingId) => {
    try {
      await api.post(`/matches/join/${bookingId}`);
      toast.success("Το αίτημα στάλθηκε!");
      fetchMatches(); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Σφάλμα.");
    }
  };

  const filteredRequests = myRequests.filter(req => {
      if (!req.booking) return false;
      const today = new Date().toISOString().split('T')[0];
      const isPast = req.booking.date < today;
      const isCancelled = req.booking.status === 'cancelled' || req.booking.status === 'completed';
      const isRejected = req.status === 'rejected';

      if (requestView === 'active') return !isPast && !isCancelled && !isRejected;
      if (requestView === 'history') return isPast || isCancelled;
      if (requestView === 'rejected') return isRejected;
      return true;
  });

  return (
    <>
      <DashboardNavbar />
      <div className="container mt-4 mb-5">
        <ul className="nav nav-pills mb-4 justify-content-center shadow-sm p-2 bg-white rounded-pill">
            <li className="nav-item">
                <button className={`nav-link px-4 fw-bold rounded-pill ${activeTab === 'finder' ? 'active' : ''}`} onClick={() => setActiveTab('finder')}>
                    <i className="bi bi-search me-2"></i>Εύρεση Αγώνα
                </button>
            </li>
            <li className="nav-item ms-2">
                <button className={`nav-link px-4 fw-bold rounded-pill ${activeTab === 'my_requests' ? 'active' : ''}`} onClick={() => setActiveTab('my_requests')}>
                    <i className="bi bi-person-check me-2"></i>Οι Συμμετοχές μου
                </button>
            </li>
        </ul>

        {activeTab === 'finder' && (
            <>
                <div className="mb-4">
                    <h2 className="fw-bold m-0 text-primary">⚽ Player Finder</h2>
                    <p className="text-muted">Βρες ομάδες που ψάχνουν παίκτες και μπες στο παιχνίδι!</p>
                </div>
                <div className="card shadow-sm border-0 mb-4 bg-white rounded-4">
                    <div className="card-body py-3 d-flex flex-wrap gap-4 align-items-center">
                        <div className="d-flex align-items-center">
                            <i className="bi bi-funnel text-muted me-2"></i>
                            <select className="form-select form-select-sm w-auto border-light-subtle shadow-none" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                <option value="all">Όλοι οι τύποι</option>
                                <option value="5x5">5x5</option><option value="6x6">6x6</option><option value="7x7">7x7</option><option value="8x8">8x8</option><option value="11x11">11x11</option>
                            </select>
                        </div>
                        <div className="d-flex align-items-center">
                            <i className="bi bi-geo-alt text-muted me-2"></i>
                            <select className="form-select form-select-sm w-auto border-light-subtle shadow-none" value={filterFacility} onChange={(e) => setFilterFacility(e.target.value)}>
                                <option value="all">Όλες οι εγκαταστάσεις</option>
                                {facilities.map(fac => <option key={fac._id} value={fac._id}>{fac.name}</option>)}
                            </select>
                        </div>
                        {(filterType !== 'all' || filterFacility !== 'all') && (
                            <button className="btn btn-link btn-sm text-danger text-decoration-none p-0 fw-bold" onClick={() => {setFilterType('all'); setFilterFacility('all');}}>Καθαρισμός</button>
                        )}
                    </div>
                </div>
                {loading ? <div className="text-center py-5"><div className="spinner-border text-primary"></div></div> : 
                 matches.length === 0 ? <div className="text-center py-5 bg-white rounded-4 border-0 shadow-sm"><h4>Δεν βρέθηκαν διαθέσιμοι αγώνες</h4></div> : (
                    <div className="row g-4">
                        {matches.map((match) => (
                            <div className="col-md-6 col-lg-4" key={match._id}>
                                <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden border-top border-primary border-4 hover-scale">
                                    <div className="card-body">
                                        <h5 className="fw-bold text-dark">{match.field?.name} <span className="badge bg-light text-dark border float-end small">{match.field?.type}</span></h5>
                                        <p className="text-muted small mb-1"><i className="bi bi-geo-alt me-1 text-danger"></i>{match.facility?.name}</p>
                                        
                                        {match.facility?.phone && (
                                            <p className="text-muted small mb-3">
                                                <i className="bi bi-telephone me-1 text-success"></i>
                                                <a href={`tel:${match.facility.phone}`} className="text-decoration-none text-muted">{match.facility.phone}</a>
                                            </p>
                                        )}
                                        
                                        <div className="bg-light p-3 rounded-3 mb-3 text-center border-0">
                                            <span className="fw-bold text-dark">{match.date}</span> <br/> 
                                            <span className="text-primary fw-bold fs-5">{match.timeSlot}</span>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <span className="badge bg-warning-subtle text-dark border border-warning-subtle px-3 py-2 rounded-pill fw-bold"><i className="bi bi-people-fill me-1"></i>Ζητούνται: {match.playersNeeded}</span>
                                            <small className="text-muted">Org: <strong>{match.user?.firstName}</strong></small>
                                        </div>

                                        <button className="btn btn-primary w-100 fw-bold py-2 rounded-pill shadow-sm" onClick={() => handleJoin(match._id)}>Δήλωση Συμμετοχής</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </>
        )}

        {activeTab === 'my_requests' && (
            <>
                <div className="d-flex justify-content-between align-items-end mb-4">
                    <div>
                        <h2 className="fw-bold m-0 text-success">📋 Οι Συμμετοχές μου</h2>
                        <p className="text-muted mb-0">Διαχειρίσου τα αιτήματά σου.</p>
                    </div>
                </div>

                <div className="btn-group shadow-sm mb-4 bg-white rounded p-1 w-100 w-md-auto">
                    <button className={`btn btn-sm px-3 fw-bold rounded ${requestView === 'active' ? 'btn-success text-white' : 'btn-light text-muted'}`} onClick={() => setRequestView('active')}>Ενεργές & Εκκρεμείς</button>
                    <button className={`btn btn-sm px-3 fw-bold rounded ${requestView === 'history' ? 'btn-secondary text-white' : 'btn-light text-muted'}`} onClick={() => setRequestView('history')}>Ιστορικό</button>
                    <button className={`btn btn-sm px-3 fw-bold rounded ${requestView === 'rejected' ? 'btn-danger text-white' : 'btn-light text-muted'}`} onClick={() => setRequestView('rejected')}>Απορριφθείσες</button>
                </div>
                {loading ? <div className="text-center py-5"><div className="spinner-border text-success"></div></div> : 
                 filteredRequests.length === 0 ? <div className="text-center py-5 bg-white rounded-4 border-0 shadow-sm"><h5 className="mt-3">Η λίστα είναι άδεια.</h5></div> : (
                    <div className="row g-3">
                        {filteredRequests.map(req => (
                            <div className="col-12 col-xl-8 mx-auto" key={req._id}>
                                <div className={`card shadow-sm border-0 border-start border-4 rounded-3 overflow-hidden ${
                                    req.status === 'accepted' ? 'border-success' : 
                                    req.status === 'rejected' ? 'border-danger' : 
                                    req.booking?.status === 'cancelled' ? 'border-secondary' : 'border-warning'
                                }`}>
                                    <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
                                        <div className="flex-grow-1">
                                            <h6 className="fw-bold mb-1 text-dark">{req.booking?.field?.name} <span className="text-muted fw-normal">at</span> {req.booking?.facility?.name}</h6>
                                            <div className="small text-muted mb-2"><i className="bi bi-calendar3 me-1"></i>{req.booking?.date} | <i className="bi bi-clock me-1"></i>{req.booking?.timeSlot}</div> 
                                            <div className="d-flex gap-3 mt-2 flex-wrap">
                                                {req.booking?.facility?.phone && (
                                                    <div className="small bg-light p-1 px-2 rounded border">
                                                        <i className="bi bi-building me-1 text-muted"></i>
                                                        Γήπεδο: <a href={`tel:${req.booking.facility.phone}`} className="text-dark fw-bold text-decoration-none">{req.booking.facility.phone}</a>
                                                    </div>
                                                )}
                                                {req.status === 'accepted' && req.booking?.user?.phone && (
                                                    <div className="small bg-primary-subtle p-1 px-2 rounded border border-primary-subtle text-primary">
                                                        <i className="bi bi-person-fill me-1"></i>
                                                        Διοργανωτής: <a href={`tel:${req.booking.user.phone}`} className="fw-bold text-decoration-none">{req.booking.user.phone}</a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            {req.booking?.status === 'cancelled' ? <span className="badge bg-secondary">Ακυρώθηκε</span> : 
                                             <span className={`badge px-3 py-2 rounded-pill shadow-sm ${
                                                req.status === 'accepted' ? 'bg-success' : 
                                                req.status === 'pending' ? 'bg-warning text-dark' : 'bg-danger'
                                            }`}>
                                                {req.status === 'accepted' ? 'Εγκρίθηκε' : 
                                                 req.status === 'pending' ? 'Σε αναμονή' : 'Απορρίφθηκε'}
                                            </span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </>
        )}
      </div>
      <style jsx="true">{` .hover-scale:hover { transform: scale(1.02); transition: 0.2s; } `}</style>
    </>
  );
};

export default UserDashboard;