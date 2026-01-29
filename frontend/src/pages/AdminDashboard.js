import React, { useState, useEffect } from 'react';
import api from '../api/axios'; 
import { toast } from 'react-toastify';
import DashboardNavbar from '../components/DashboardNavbar';


import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ setLat, setLng, lat, lng }) {
    useMapEvents({
        click(e) {
            setLat(e.latlng.lat);
            setLng(e.latlng.lng);
        },
    });
    return lat && lng ? <Marker position={[lat, lng]} /> : null;
}

const AdminDashboard = () => {

  const [activeTab, setActiveTab] = useState('users'); 
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [stats, setStats] = useState({ 
      totalUsers: 0, totalFacilities: 0, totalFields: 0, 
      activeBookings: 0, completedBookings: 0 
  });
  
  const [pendingRequests, setPendingRequests] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [managers, setManagers] = useState([]); 
  const [mapLat, setMapLat] = useState(37.9838);
  const [mapLng, setMapLng] = useState(23.7275);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phone: '',
    description: '',
    imageUrl: '',
    owner: ''
  });

  const [editingId, setEditingId] = useState(null);
  const fetchData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);

      const [statsRes, pendingRes, facilitiesRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/pending-users'),
        api.get('/facilities'),
        api.get('/admin/users')
      ]);

      setStats(statsRes.data);
      setPendingRequests(pendingRes.data);
      setFacilities(facilitiesRes.data);
      setManagers(usersRes.data.filter(u => u.role === 'facility_manager'));

    } catch (error) {
      console.error("Admin Fetch Error:", error);
      if (!isBackground) toast.error("Σφάλμα φόρτωσης δεδομένων.");
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);
    const intervalId = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(intervalId);
  }, []);


  const handleApprove = async (id) => {
    try {
        await api.put(`/admin/approve/${id}`, {});
        toast.success("Εγκρίθηκε!");
        fetchData(true); 
    } catch (err) {
        toast.error("Αποτυχία έγκρισης.");
    }
  };

  const handleReject = async (userId) => {
    if (window.confirm('Διαγραφή αίτησης;')) {
      try {
        await api.delete(`/admin/reject/${userId}`);
        toast.info('Απορρίφθηκε.');
        fetchData(true);
      } catch (error) {
        toast.error("Σφάλμα απόρριψης.");
      }
    }
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);
    setUploading(true);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await api.post('/facilities/upload', formDataUpload, config);
      setFormData({ ...formData, imageUrl: data });
      setUploading(false);
      toast.success('Εικόνα ανέβηκε!');
    } catch (error) {
      setUploading(false);
      toast.error('Σφάλμα upload.');
    }
  };


  const resetForm = () => {
      setFormData({ name: '', location: '', phone: '', description: '', imageUrl: '', owner: '' });
      setEditingId(null);
      setMapLat(37.9838);
      setMapLng(23.7275);
  };

  const handleEditClick = (facility) => {
      setEditingId(facility._id);
      setFormData({
          name: facility.name,
          location: facility.location,
          phone: facility.phone || '',
          description: facility.description || '',
          imageUrl: facility.imageUrl || '',
          owner: facility.owner ? facility.owner._id : ''
      });
      if (facility.geo && facility.geo.coordinates) {
          setMapLng(facility.geo.coordinates[0]);
          setMapLat(facility.geo.coordinates[1]);
      }
  };

  const handleSubmitFacility = async (e) => {
    e.preventDefault();
    const payload = { ...formData, lat: mapLat, lng: mapLng };

    try {
        if (editingId) {
            await api.put(`/facilities/${editingId}`, payload);
            toast.success("Ενημερώθηκε!");
        } else {
            await api.post('/facilities', payload);
            toast.success("Δημιουργήθηκε!");
        }
        resetForm();
        fetchData(true);
    } catch (error) {
        console.error(error);
        toast.error("Σφάλμα: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteFacility = async (id) => {
    if (window.confirm('Διαγραφή εγκατάστασης;')) {
      try {
        await api.delete(`/facilities/${id}`);
        toast.success('Διαγράφηκε.');
        fetchData(true);
      } catch (error) {
        toast.error("Αποτυχία διαγραφής.");
      }
    }
  };

  return (
    <>
      <DashboardNavbar />

      <div className="container mt-4 pb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
             <h2 className="fw-bold text-dark">Admin Console</h2>
             <p className="text-muted mb-0 small text-uppercase fw-bold">Κεντρική διαχείριση συστήματος</p>
          </div>
          <button className="btn btn-primary rounded-pill btn-sm px-3 shadow-sm" onClick={() => fetchData(false)}>
            <i className="bi bi-arrow-clockwise me-2"></i>Ανανέωση
          </button>
        </div>

        <div className="row row-cols-2 row-cols-md-3 g-3 mb-5">
           <div className="col"><div className="card bg-primary text-white h-100 rounded-4 p-3 text-center"><h2 className="fw-bold m-0">{loading ? '-' : stats.totalUsers}</h2><small>ΧΡΗΣΤΕΣ</small></div></div>
           <div className="col"><div className="card bg-success text-white h-100 rounded-4 p-3 text-center"><h2 className="fw-bold m-0">{loading ? '-' : stats.totalFacilities}</h2><small>ΕΓΚΑΤΑΣΤΑΣΕΙΣ</small></div></div>
           <div className="col"><div className="card bg-warning text-dark h-100 rounded-4 p-3 text-center"><h2 className="fw-bold m-0">{loading ? '-' : pendingRequests.length}</h2><small>ΕΚΚΡΕΜΕΙΣ</small></div></div>
        </div>

        <ul className="nav nav-pills mb-4 gap-2 bg-white p-2 rounded-pill shadow-sm d-inline-flex">
          <li className="nav-item">
            <button className={`nav-link rounded-pill px-4 fw-bold ${activeTab === 'users' ? 'active' : 'text-muted'}`} onClick={() => setActiveTab('users')}>Users</button>
          </li>
          <li className="nav-item">
            <button className={`nav-link rounded-pill px-4 fw-bold ${activeTab === 'facilities' ? 'active' : 'text-muted'}`} onClick={() => setActiveTab('facilities')}>Facilities</button>
          </li>
        </ul>

        {activeTab === 'users' && (
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden fade-in">
             <div className="card-body p-0">
                 {loading ? <div className="text-center py-5"><div className="spinner-border text-primary"></div></div> : 
                 pendingRequests.length === 0 ? <p className="text-center py-4 text-muted">Empty.</p> : (
                     <table className="table table-hover mb-0">
                         <thead className="table-light"><tr><th className="ps-4">Όνομα</th><th>Email</th><th>Ενέργειες</th></tr></thead>
                         <tbody>
                             {pendingRequests.map(u => (
                                 <tr key={u._id}>
                                     <td className="ps-4 fw-bold">{u.firstName} {u.lastName}</td>
                                     <td>{u.email}</td>
                                     <td>
                                         <button className="btn btn-success btn-sm me-2" onClick={() => handleApprove(u._id)}>OK</button>
                                         <button className="btn btn-outline-danger btn-sm" onClick={() => handleReject(u._id)}>NO</button>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 )}
             </div>
          </div>
        )}

        {activeTab === 'facilities' && (
          <div className="row g-4 fade-in">
            <div className="col-lg-5">
              <div className={`card border-0 shadow-sm rounded-4 overflow-hidden ${editingId ? 'border border-warning' : ''}`}>
                <div className={`card-header text-white py-3 border-0 ${editingId ? 'bg-warning text-dark' : 'bg-dark'}`}>
                  <h5 className="mb-0 fw-bold">{editingId ? '✏️ Επεξεργασία' : '➕ Νέα Εγκατάσταση'}</h5>
                </div>
                <div className="card-body p-4">
                  <form onSubmit={handleSubmitFacility}>
                    
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted">ΟΝΟΜΑ</label>
                      <input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted">ΔΙΕΥΘΥΝΣΗ</label>
                      <input type="text" className="form-control" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                    </div>
                    
                    <div className="row g-2 mb-3">
                        <div className="col-6">
                            <label className="form-label small fw-bold text-muted">ΤΗΛΕΦΩΝΟ</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                required 
                                value={formData.phone} 
                                onChange={e => setFormData({...formData, phone: e.target.value})} 
                                placeholder="210..."
                            />
                        </div>
                        <div className="col-6">
                            <label className="form-label small fw-bold text-muted">ΕΙΚΟΝΑ</label>
                            <input type="file" className="form-control" onChange={uploadFileHandler} />
                            {uploading && <div className="text-primary small mt-1">Uploading...</div>}
                            <input type="text" className="form-control mt-1" style={{fontSize: '0.7rem'}} placeholder="URL" value={formData.imageUrl} readOnly />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">ΠΕΡΙΓΡΑΦΗ</label>
                        <textarea className="form-control" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">ΤΟΠΟΘΕΣΙΑ ΧΑΡΤΗ</label>
                        <div className="border rounded overflow-hidden" style={{ height: '200px' }}>
                            <MapContainer center={[mapLat, mapLng]} zoom={12} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <LocationMarker setLat={setMapLat} setLng={setMapLng} lat={mapLat} lng={mapLng} />
                            </MapContainer>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label small fw-bold text-muted">ΥΠΕΥΘΥΝΟΣ (MANAGER)</label>
                        <select className="form-select" value={formData.owner} onChange={e => setFormData({...formData, owner: e.target.value})}>
                            <option value="">-- Χωρίς Υπεύθυνο --</option>
                            {managers.map(mgr => <option key={mgr._id} value={mgr._id}>{mgr.firstName} {mgr.lastName}</option>)}
                        </select>
                    </div>

                    <div className="d-grid gap-2">
                      <button type="submit" className={`btn fw-bold py-2 rounded-pill shadow-sm ${editingId ? 'btn-warning' : 'btn-primary'}`}>
                        {editingId ? 'Αποθήκευση' : 'Δημιουργία'}
                      </button>
                      {editingId && <button type="button" className="btn btn-link text-muted small" onClick={resetForm}>Ακύρωση</button>}
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                <div className="card-header bg-white py-3 border-bottom"><h5 className="mb-0 fw-bold">Λίστα Εγκαταστάσεων</h5></div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light small"><tr><th className="ps-4">Όνομα</th><th>Πληροφορίες</th><th className="text-end pe-4">Ενέργειες</th></tr></thead>
                      <tbody>
                        {facilities.map(fac => (
                          <tr key={fac._id}>
                            <td className="ps-4">
                                <div className="fw-bold text-primary">{fac.name}</div>
                                <small className="text-muted d-block">{fac.location}</small>
                            </td>
                            <td>
                                <div className="small"><i className="bi bi-telephone me-1"></i>{fac.phone || '-'}</div>
                                <div className="small text-success"><i className="bi bi-person me-1"></i>{fac.owner ? fac.owner.lastName : 'N/A'}</div>
                            </td>
                            <td className="text-end pe-4">
                              <button className="btn btn-sm btn-light text-primary me-2 rounded-pill" onClick={() => handleEditClick(fac)}>Edit</button>
                              <button className="btn btn-sm btn-light text-danger rounded-pill" onClick={() => handleDeleteFacility(fac._id)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx="true">{`
        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
};

export default AdminDashboard;