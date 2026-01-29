import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios'; 
import socket from '../api/socket'; 
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import DashboardNavbar from '../components/DashboardNavbar';

const ManagerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [facilityData, setFacilityData] = useState({
    start: '09:00',
    end: '23:00',
    duration: 60,
    id: ''
  });


  const fetchData = useCallback(async () => {
    try {
      const [bookingsRes, facilityRes] = await Promise.all([
        api.get('/bookings/facility-requests'),
        api.get('/facilities/my-facility')
      ]);
      
      setBookings(bookingsRes.data);
      if (facilityRes.data) {
        setFacilityData({
          start: facilityRes.data.operatingHours?.start || '09:00',
          end: facilityRes.data.operatingHours?.end || '23:00',
          duration: facilityRes.data.slotDuration || 60,
          id: facilityRes.data._id
        });
      }
    } catch (error) {
      console.error("Fetch Error:", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  useEffect(() => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));


      if (!socket.connected) socket.connect();
      if (userInfo) socket.emit("setup", userInfo);

 
      const handleNotification = (newNotif) => {
          if (newNotif.type === 'booking_request') {
              toast.info(`🔔 ${newNotif.message}`);
              fetchData();
          }
      };

      socket.on('new_notification', handleNotification);

      return () => {
          socket.off('new_notification', handleNotification);
      };
  }, [fetchData]);

 
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/bookings/${id}/status`, { status: newStatus });
      toast.success(newStatus === 'confirmed' ? 'Η κράτηση εγκρίθηκε!' : 'Η κράτηση απορρίφθηκε.');
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b));
    } catch (error) {
      toast.error('Σφάλμα κατά την ενημέρωση.');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/facilities/${facilityData.id}`, {
        operatingHours: { start: facilityData.start, end: facilityData.end },
        slotDuration: facilityData.duration
      });
      toast.success("Οι ρυθμίσεις ωραρίου ενημερώθηκαν!");
      setShowSettingsModal(false);
    } catch (error) {
      toast.error("Σφάλμα κατά την αποθήκευση");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
        case 'confirmed': return <span className="badge bg-success">Επιβεβαιωμένη</span>;
        case 'pending': return <span className="badge bg-warning text-dark">Εκκρεμεί</span>;
        case 'cancelled': return <span className="badge bg-danger">Ακυρώθηκε</span>;
        case 'completed': return <span className="badge bg-secondary">Ολοκληρωμένη</span>;
        case 'rejected': return <span className="badge bg-danger">Απορρίφθηκε</span>;
        default: return <span className="badge bg-warning text-dark">Εκκρεμεί</span>;
    }
  };

  return (
    <>
      <DashboardNavbar />
      <div className="container mt-4 mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold m-0 text-dark">Διαχείριση Κρατήσεων</h2>
          <div className="d-flex gap-2">
            <button className="btn btn-dark shadow-sm px-3" onClick={() => setShowSettingsModal(true)}>
              <i className="bi bi-gear-fill me-2"></i>Ωράριο & Slots
            </button>
            <Link to="/manager-dashboard" className="btn btn-outline-secondary px-3">
              <i className="bi bi-arrow-left me-2"></i>Πίσω
            </Link>
          </div>
        </div>
        <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-5 text-muted"><h5>Δεν υπάρχουν αιτήματα κρατήσεων.</h5></div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-uppercase small fw-bold">
                    <tr>
                      <th className="ps-4 py-3">Ημερομηνία & Ώρα</th>
                      <th className="py-3">Γήπεδο</th>
                      <th className="py-3">Πελάτης</th>
                      <th className="py-3">Κατάσταση</th>
                      <th className="text-end pe-4 py-3">Ενέργειες</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking._id}>
                        <td className="ps-4">
                          <div className="fw-bold">{booking.date}</div>
                          <div className="text-primary small fw-bold">{booking.timeSlot}</div>
                        </td>
                        <td>
                          <div className="fw-bold">{booking.field?.name}</div>
                          <small className="badge bg-light text-dark border-0 shadow-none" style={{fontSize: '0.7rem'}}>{booking.field?.type}</small>
                        </td>
                        <td>
                          <div className="fw-bold small">{booking.user?.firstName} {booking.user?.lastName}</div>
                          <div className="text-muted" style={{fontSize: '0.75rem'}}>{booking.user?.email}</div>
                          <div className="text-muted" style={{fontSize: '0.75rem'}}>{booking.user?.phone}</div>
                        </td>
                        <td>{getStatusBadge(booking.status)}</td>
                        <td className="text-end pe-4">
                          {booking.status === 'pending' && (
                            <div className="d-flex justify-content-end gap-2">
                              <button className="btn btn-success btn-sm px-3 shadow-sm" title="Έγκριση" onClick={() => handleStatusUpdate(booking._id, 'confirmed')}>
                                <i className="bi bi-check-lg"></i>
                              </button>
                              <button className="btn btn-danger btn-sm px-3 shadow-sm" title="Απόρριψη" onClick={() => handleStatusUpdate(booking._id, 'rejected')}>
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        {showSettingsModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header bg-dark text-white border-0 py-3">
                  <h5 className="modal-title fw-bold">⚙️ Ρυθμίσεις Εγκατάστασης</h5>
                  <button className="btn-close btn-close-white shadow-none" onClick={() => setShowSettingsModal(false)}></button>
                </div>
                <form onSubmit={handleSaveSettings}>
                  <div className="modal-body p-4">
                    <div className="row g-3">
                      <div className="col-6">
                        <label className="form-label fw-bold small text-muted text-uppercase">Έναρξη Λειτουργίας</label>
                        <input type="time" className="form-control rounded-3" value={facilityData.start} 
                          onChange={(e) => setFacilityData({...facilityData, start: e.target.value})} />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-bold small text-muted text-uppercase">Λήξη Λειτουργίας</label>
                        <input type="time" className="form-control rounded-3" value={facilityData.end} 
                          onChange={(e) => setFacilityData({...facilityData, end: e.target.value})} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="form-label fw-bold small text-muted text-uppercase">Διάρκεια Slot (Λεπτά)</label>
                      <select className="form-select rounded-3" value={facilityData.duration} 
                        onChange={(e) => setFacilityData({...facilityData, duration: parseInt(e.target.value)})}>
                        <option value={60}>60 λεπτά</option>
                        <option value={90}>90 λεπτά</option>
                        <option value={120}>120 λεπτά</option>
                      </select>
                      <small className="text-muted d-block mt-2">Η αλλαγή της διάρκειας θα επηρεάσει τα μελλοντικά διαθέσιμα slots.</small>
                    </div>
                  </div>
                  <div className="modal-footer bg-light border-0 py-3 rounded-bottom-4">
                    <button type="button" className="btn btn-link text-muted text-decoration-none fw-bold" onClick={() => setShowSettingsModal(false)}>Ακύρωση</button>
                    <button type="submit" className="btn btn-primary px-4 fw-bold rounded-pill shadow-sm">Αποθήκευση Αλλαγών</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ManagerBookings;