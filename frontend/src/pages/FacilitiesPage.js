import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios'; 
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; 
import L from 'leaflet';

import logo from '../assets/logo.png';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const FacilitiesPage = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem('token');

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const { data } = await api.get('/facilities/list');
        setFacilities(data);
      } catch (error) {
        console.error("Error fetching facilities:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFacilities();
  }, []);

  return (
    <div className="bg-light min-vh-100">
      
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
        <div className="container">
          <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
             <img src={logo} alt="MatchHub Logo" style={{ height: '35px', marginRight: '10px' }} />
             MatchHub
          </Link>

          <button 
            className="btn btn-outline-light btn-sm rounded-pill px-3"
            onClick={() => navigate(-1)} 
          >
            <i className="bi bi-arrow-left me-2"></i> Πίσω
          </button>
        </div>
      </nav>

      <div className="container py-4">
        <div className="row mb-4">
            <div className="col-12 text-center">
                <h2 className="fw-bold display-6">Όλα τα Γήπεδα</h2>
                <p className="text-muted">Βρες το κοντινότερο γήπεδο και κάνε κράτηση άμεσα.</p>
            </div>
        </div>

        {loading ? (
           <div className="text-center py-5">
             <div className="spinner-border text-primary" role="status"></div>
             <p className="mt-2 text-muted">Φόρτωση γηπέδων...</p>
           </div>
        ) : (
          <>

            <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-5">
                <div style={{ height: "400px", width: "100%" }}>
                    <MapContainer 
                        center={[37.9838, 23.7275]} 
                        zoom={11} 
                        scrollWheelZoom={false} 
                        style={{ height: "100%", width: "100%" }}
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {facilities.map((f) => {
                            const lng = f.geo?.coordinates?.[0];
                            const lat = f.geo?.coordinates?.[1];
                            if (!lat || !lng) return null;

                            return (
                                <Marker key={f._id} position={[lat, lng]}>
                                    <Popup>
                                        <div className="text-center">
                                            <strong>{f.name}</strong><br/>
                                            <small>{f.pricePerHour}€ / ώρα</small><br/>
                                            <Link to={`/facilities/${f._id}`} className="btn btn-primary btn-sm mt-2">
                                                Προβολή
                                            </Link>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                </div>
            </div>

            <div className="row g-4">
                {facilities.map((f) => (
                    <div className="col-md-6 col-lg-4" key={f._id}>
                        <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden hover-card">
                            <div 
                                className="bg-dark position-relative"
                                style={{
                                    height: '200px', 
                                    backgroundImage: `url(${f.imageUrl || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=800'})`, 
                                    backgroundSize:'cover', 
                                    backgroundPosition:'center'
                                }}
                            >
                                <span className="position-absolute top-0 end-0 bg-success text-white px-3 py-1 m-3 rounded-pill fw-bold small shadow">
                                    {f.pricePerHour}€ / ώρα
                                </span>
                            </div>

                            <div className="card-body p-4">
                                <h5 className="card-title fw-bold mb-2">{f.name}</h5>
                                <p className="card-text text-muted small mb-3">
                                    <i className="bi bi-geo-alt-fill text-danger me-1"></i> 
                                    {f.location}
                                </p>
                                <p className="card-text text-muted small line-clamp-3">
                                    {f.description || "Δεν υπάρχει περιγραφή."}
                                </p>
                            </div>

                            <div className="card-footer bg-white border-0 p-4 pt-0">
                                <Link 
                                    to={isLoggedIn ? `/facilities/${f._id}` : "/login"} 
                                    className="btn btn-outline-primary w-100 rounded-pill fw-bold"
                                >
                                    {isLoggedIn ? 'Κράτηση / Λεπτομέρειες' : 'Σύνδεση για Κράτηση'}
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {facilities.length === 0 && (
                    <div className="col-12 text-center py-5">
                        <h4 className="text-muted">Δεν βρέθηκαν γήπεδα.</h4>
                    </div>
                )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FacilitiesPage;