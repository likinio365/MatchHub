import React, { useState, useEffect } from 'react';
import api from '../api/axios'; 
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import DashboardNavbar from '../components/DashboardNavbar';

const ManagerDashboard = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [showModal, setShowModal] = useState(false); 
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('5x5');
  const [pricePerHour, setPricePerHour] = useState(50);
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [facilityData, setFacilityData] = useState({
    start: '09:00',
    end: '23:00',
    duration: 60,
    id: ''
  });

  useEffect(() => {
    const fetchInitialData = async () => {
        try {
            const [fieldsRes, facRes] = await Promise.all([
                api.get('/fields/my-fields'),
                api.get('/facilities/my-facility')
            ]);

            setFields(fieldsRes.data);
            if (facRes.data) {
                setFacilityData({
                    start: facRes.data.operatingHours?.start || '09:00',
                    end: facRes.data.operatingHours?.end || '23:00',
                    duration: facRes.data.slotDuration || 60,
                    id: facRes.data._id
                });
            }
        } catch (error) {
            if (error.response?.status !== 404) {
                console.error("Fetch Error:", error.message);
                toast.error("Σφάλμα κατά τη φόρτωση των δεδομένων.");
            }
        } finally {
            setLoading(false);
        }
    };
    fetchInitialData();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setName('');
    setType('5x5');
    setPricePerHour(50);
    setFile(null);
    setShowModal(true); 
  };

  const handleEditClick = (field) => {
    setEditId(field._id);
    setName(field.name);
    setType(field.type);
    setPricePerHour(field.pricePerHour);
    setFile(null);
    setShowModal(true); 
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditId(null);
  };

  const handleToggle = async (field) => {
    const originalState = field.isAvailable;
    const updatedFields = fields.map(f => 
        f._id === field._id ? { ...f, isAvailable: !f.isAvailable } : f
    );
    setFields(updatedFields);

    try {
        await api.patch(`/fields/${field._id}/toggle`);
        toast.success(originalState ? 'Το γήπεδο τέθηκε σε συντήρηση' : 'Το γήπεδο είναι πλέον διαθέσιμο');
    } catch (error) {
        setFields(fields); 
        toast.error('Αποτυχία ενημέρωσης κατάστασης.');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Είστε σίγουροι για την οριστική διαγραφή του γηπέδου;')) {
        const previousFields = [...fields];
        setFields(fields.filter(f => f._id !== id));
        try {
            await api.delete(`/fields/${id}`);
            toast.success('Το γήπεδο διαγράφηκε επιτυχώς.');
        } catch (error) {
            setFields(previousFields);
            toast.error('Σφάλμα κατά τη διαγραφή.');
        }
    }
  };

  const onSubmitField = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('type', type);
    formData.append('pricePerHour', pricePerHour);
    if (file) formData.append('image', file);

    try {
      let res;
      if (editId) {
        res = await api.put(`/fields/${editId}`, formData);
        setFields(prev => prev.map(f => f._id === editId ? res.data : f));
        toast.success('Τα στοιχεία του γηπέδου ενημερώθηκαν!');
      } else {
        res = await api.post('/fields', formData);
        setFields(prev => [...prev, res.data]);
        toast.success('Το νέο γήπεδο δημιουργήθηκε!');
      }
      handleCloseModal(); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Σφάλμα κατά την αποθήκευση.');
    }
  };

  const onSaveSettings = async (e) => {
    e.preventDefault();
    try {
        await api.put(`/facilities/${facilityData.id}`, {
            operatingHours: { start: facilityData.start, end: facilityData.end },
            slotDuration: facilityData.duration
        });
        toast.success("Οι ρυθμίσεις ωραρίου ενημερώθηκαν επιτυχώς!");
        setShowSettingsModal(false);
    } catch (error) {
        toast.error("Αποτυχία αποθήκευσης ρυθμίσεων.");
    }
  };

  const onFileChange = (e) => setFile(e.target.files[0]);

  return (
    <>
      <DashboardNavbar />
      <div className="container mt-4 mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold m-0 text-dark">Facility Dashboard</h2>
            
            <div className="d-flex gap-2">
                <button className="btn btn-outline-dark shadow-sm" onClick={() => setShowSettingsModal(true)}>
                    <i className="bi bi-gear-fill me-2"></i>Ωράριο & Slots
                </button>
                <Link to="/manager/bookings" className="btn btn-primary shadow-sm">
                    <i className="bi bi-calendar-check me-2"></i>Κρατήσεις
                </Link>
                <button className="btn btn-success shadow-sm" onClick={handleOpenCreate}>
                    <i className="bi bi-plus-lg me-2"></i>Νέο Γήπεδο
                </button>
            </div>
        </div>
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-header bg-white py-3 border-bottom">
            <h5 className="mb-0 fw-bold"><i className="bi bi-trophy me-2 text-success"></i>Τα Γήπεδά μου</h5>
          </div>
          <div className="card-body p-0">
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-success"></div>
                    <p className="mt-2 text-muted">Φόρτωση δεδομένων...</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr className="small text-uppercase fw-bold">
                                <th className="ps-4">Εικόνα</th>
                                <th>Πληροφορίες</th>
                                <th>Κατάσταση</th>
                                <th className="text-end pe-4">Ενέργειες</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((field) => (
                                <tr key={field._id}>
                                    <td className="ps-4">
                                        <img 
                                            src={field.imageUrl || 'https://via.placeholder.com/60'} 
                                            alt="field" 
                                            className="rounded-3 shadow-sm"
                                            style={{width:'60px', height:'60px', objectFit:'cover', filter: field.isAvailable ? 'none' : 'grayscale(100%)'}} 
                                        />
                                    </td>
                                    <td>
                                        <div className="fw-bold text-dark">{field.name}</div>
                                        <div className="small text-muted">{field.type} • <span className="text-success fw-bold">{field.pricePerHour}€</span></div>
                                    </td>
                                    <td>
                                        <div className="form-check form-switch">
                                            <input className="form-check-input" type="checkbox" role="switch" checked={field.isAvailable} onChange={() => handleToggle(field)} />
                                            <label className="form-check-label small fw-semibold text-muted">{field.isAvailable ? 'Ενεργό' : 'Συντήρηση'}</label>
                                        </div>
                                    </td>
                                    <td className="text-end pe-4">
                                        <button className="btn btn-sm btn-light border me-2" title="Επεξεργασία" onClick={() => handleEditClick(field)}><i className="bi bi-pencil text-primary"></i></button>
                                        <button className="btn btn-sm btn-light border" title="Διαγραφή" onClick={() => handleDelete(field._id)}><i className="bi bi-trash text-danger"></i></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {fields.length === 0 && <div className="text-center py-5 text-muted"><h5>Δεν υπάρχουν καταχωρημένα γήπεδα.</h5></div>}
                </div>
            )}
          </div>
        </div>
        {showModal && (
            <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className={`modal-header text-white border-0 ${editId ? 'bg-primary' : 'bg-success'}`}>
                            <h5 className="modal-title fw-bold">{editId ? '✏️ Επεξεργασία Γηπέδου' : '⚽ Δημιουργία Γηπέδου'}</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
                        </div>
                        <div className="modal-body p-4">
                            <form onSubmit={onSubmitField}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold small text-muted text-uppercase">Όνομα Γηπέδου</label>
                                    <input type="text" className="form-control rounded-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="π.χ. Arena A" required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold small text-muted text-uppercase">Τύπος Γηπέδου</label>
                                    <select className="form-select rounded-3" value={type} onChange={(e) => setType(e.target.value)}>
                                        <option value="5x5">5x5</option>
                                        <option value="6x6">6x6</option>
                                        <option value="7x7">7x7</option>
                                        <option value="8x8">8x8</option>
                                        <option value="11x11">11x11</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold small text-muted text-uppercase">Τιμή Ενοικίασης (€/ώρα)</label>
                                    <input type="number" className="form-control rounded-3" value={pricePerHour} onChange={(e) => setPricePerHour(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold small text-muted text-uppercase">Φωτογραφία Γηπέδου</label>
                                    <input type="file" className="form-control rounded-3" onChange={onFileChange} accept="image/*" />
                                </div>
                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <button type="button" className="btn btn-link text-muted text-decoration-none" onClick={handleCloseModal}>Ακύρωση</button>
                                    <button type="submit" className={`btn px-4 fw-bold rounded-pill ${editId ? 'btn-primary' : 'btn-success'}`}>{editId ? 'Ενημέρωση' : 'Δημιουργία'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )}
        {showSettingsModal && (
            <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header bg-dark text-white border-0 py-3">
                            <h5 className="modal-title fw-bold">⚙️ Ρυθμίσεις Ωραρίου & Slots</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={() => setShowSettingsModal(false)}></button>
                        </div>
                        <form onSubmit={onSaveSettings}>
                            <div className="modal-body p-4">
                                <div className="row g-3 mb-4">
                                    <div className="col-6">
                                        <label className="form-label fw-bold small text-muted text-uppercase">Έναρξη</label>
                                        <input type="time" className="form-control rounded-3" value={facilityData.start} 
                                            onChange={(e) => setFacilityData({...facilityData, start: e.target.value})} />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label fw-bold small text-muted text-uppercase">Λήξη</label>
                                        <input type="time" className="form-control rounded-3" value={facilityData.end} 
                                            onChange={(e) => setFacilityData({...facilityData, end: e.target.value})} />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold small text-muted text-uppercase">Διάρκεια Αγώνα</label>
                                    <select className="form-select rounded-3" value={facilityData.duration} 
                                        onChange={(e) => setFacilityData({...facilityData, duration: parseInt(e.target.value)})}>
                                        <option value={60}>60 λεπτά (1 ώρα)</option>
                                        <option value={90}>90 λεπτά (1.5 ώρα)</option>
                                        <option value={120}>120 λεπτά (2 ώρες)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer bg-light border-0 py-3 rounded-bottom-4">
                                <button type="button" className="btn btn-link text-muted text-decoration-none fw-bold" onClick={() => setShowSettingsModal(false)}>Ακύρωση</button>
                                <button type="submit" className="btn btn-primary fw-bold px-4 rounded-pill shadow-sm">Αποθήκευση Ρυθμίσεων</button>
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

export default ManagerDashboard;