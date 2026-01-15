import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios'; 
import './HomePage.css'; 

import logo from '../assets/logo.png';       

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; 
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const HomePage = () => {
  const navigate = useNavigate(); 
  
  const [facilities, setFacilities] = useState([]);
  const [stats, setStats] = useState({ facilityCount: 0, userCount: 0, bookingCount: 0 });
  const [loading, setLoading] = useState(true);
  const isLoggedIn = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  const getDashboardPath = () => {
    switch(userRole) {
      case 'admin': return '/admin-dashboard';
      case 'facility_manager': return '/manager-dashboard';
      case 'team_manager': return '/team-dashboard';
      default: return '/user-dashboard'; 
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userInfo');
    navigate('/'); 
    window.location.reload(); 
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facRes, statsRes] = await Promise.all([
            api.get('/facilities/list'),
            api.get('/public/home-stats')
        ]);
        
        setFacilities(facRes.data);
        setStats(statsRes.data);

      } catch (error) {
        console.error("Σφάλμα κατά την ανάκτηση δεδομένων:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="homepage-wrapper">
      
      
      <nav className="navbar navbar-expand-lg navbar-dark fixed-top custom-navbar py-3 shadow-sm transition-all" style={{backgroundColor: 'rgba(13, 110, 253, 0.95)', backdropFilter: 'blur(10px)'}}>
        <div className="container">
          <Link className="navbar-brand fw-bold fs-3 d-flex align-items-center" to="/">
            <img src={logo} alt="MatchHub Logo" style={{ height: '40px', marginRight: '10px' }} />
            MatchHub
          </Link>

          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto ms-lg-4">
              <li className="nav-item"><a className="nav-link active fw-semibold" href="#hero">Αρχική</a></li>
              <li className="nav-item"><a className="nav-link fw-semibold" href="#map-section">Χάρτης</a></li>
              <li className="nav-item"><a className="nav-link fw-semibold" href="#featured">Προτάσεις</a></li>
              
              <li className="nav-item dropdown">
                <button className="nav-link dropdown-toggle bg-transparent border-0 fw-semibold" data-bs-toggle="dropdown">Συνεργάτες</button>
                <ul className="dropdown-menu shadow-lg border-0">
                  {loading ? (
                    <li><span className="dropdown-item text-muted">Φόρτωση...</span></li>
                  ) : facilities.length > 0 ? (
                    <>
                        {facilities.slice(0, 5).map((f) => ( 
                        <li key={f._id}>
                            <Link className="dropdown-item" to={`/facilities/${f._id}`}>{f.name}</Link>
                        </li>
                        ))}
                        <li><hr className="dropdown-divider" /></li>
                        <li><Link className="dropdown-item fw-bold text-primary" to="/facilities">Προβολή Όλων</Link></li>
                    </>
                  ) : (
                    <li><span className="dropdown-item text-muted">Κανένας συνεργάτης</span></li>
                  )}
                </ul>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-2">
              {isLoggedIn ? (
                <div className="dropdown">
                  <button className="btn btn-outline-light dropdown-toggle fw-bold px-4 rounded-pill d-flex align-items-center gap-2" data-bs-toggle="dropdown">
                    <i className="bi bi-person-circle fs-5"></i> Λογαριασμός
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2">
                    <li className="px-3 py-2 small fw-bold text-muted border-bottom mb-1">
                        Role: {userRole?.replace('_', ' ').toUpperCase()}
                    </li>
                    <li>
                      <Link className="dropdown-item d-flex align-items-center gap-2" to={getDashboardPath()}>
                        <i className="bi bi-speedometer2 text-primary"></i>Dashboard
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right"></i>Αποσύνδεση
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link to="/login" className="btn btn-warning fw-bold px-4 rounded-pill shadow-lg hover-scale text-dark">
                  <i className="bi bi-box-arrow-in-right me-2"></i>Login / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      
      <header id="hero" className="hero-section">
        <div className="container text-center text-white position-relative z-1">
          <div className="row justify-content-center">
            <div className="col-lg-10 fade-in-up">
              <span className="badge bg-warning text-dark px-3 py-2 rounded-pill mb-3 fw-bold tracking-wider shadow-sm">
                #1 PLATFORM FOR SPORTS
              </span>
              <h1 className="display-3 fw-bold mb-4 text-shadow">
                Κλείσε Γήπεδο <br/> 
                <span className="text-warning">Παίξε Μπάλα.</span>
              </h1>
              <p className="lead mb-5 opacity-90 fs-4 text-shadow">
                Η πιο σύγχρονη πλατφόρμα διαχείρισης αθλητικών εγκαταστάσεων.
                Βρες γήπεδο, οργάνωσε την ομάδα σου, παίξε χωρίς άγχος.
              </p>
              
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link to={isLoggedIn ? getDashboardPath() : "/register"} className="btn btn-primary btn-lg px-5 rounded-pill shadow-lg fw-bold hover-scale">
                  {isLoggedIn ? "Το Dashboard μου" : "Ξεκίνα Τώρα"}
                </Link>
                <a href="#map-section" className="btn btn-outline-light btn-lg px-5 rounded-pill fw-bold hover-scale backdrop-blur">
                  Δες τον Χάρτη
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      
      <div className="bg-primary text-white py-4 shadow position-relative z-2 mt-n5 stats-strip w-100">
          <div className="container">
              <div className="row text-center">
                  <div className="col-md-4 border-end border-light-subtle">
                      <h2 className="fw-bold mb-0">{loading ? '-' : stats.facilityCount}</h2>
                      <small className="text-white-50 text-uppercase fw-bold">Συνεργαζόμενα Γήπεδα</small>
                  </div>
                  <div className="col-md-4 border-end border-light-subtle">
                      <h2 className="fw-bold mb-0">{loading ? '-' : stats.userCount}</h2>
                      <small className="text-white-50 text-uppercase fw-bold">Ενεργοί Παίκτες</small>
                  </div>
                  <div className="col-md-4">
                      <h2 className="fw-bold mb-0">24/7</h2>
                      <small className="text-white-50 text-uppercase fw-bold">Online Κρατήσεις</small>
                  </div>
              </div>
          </div>
      </div>

      
      <section id="how-it-works" className="py-5">
          <div className="container py-5">
            <div className="text-center mb-5">
                <h6 className="text-primary fw-bold text-uppercase ls-2">Διαδικασία</h6>
                <h2 className="fw-bold display-6">Πώς Λειτουργεί;</h2>
            </div>
            <div className="row g-4 text-center">
                <div className="col-md-4">
                    <div className="p-4 rounded-4 bg-light h-100 hover-card transition-all">
                        <div className="d-inline-flex align-items-center justify-content-center bg-white text-primary rounded-circle shadow-sm mb-4" style={{width:80, height:80}}>
                            <i className="bi bi-search fs-2"></i>
                        </div>
                        <h4 className="fw-bold">1. Αναζήτηση</h4>
                        <p className="text-muted">Βρες το ιδανικό γήπεδο στην περιοχή σου.</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="p-4 rounded-4 bg-light h-100 hover-card transition-all">
                        <div className="d-inline-flex align-items-center justify-content-center bg-white text-primary rounded-circle shadow-sm mb-4" style={{width:80, height:80}}>
                            <i className="bi bi-calendar-check fs-2"></i>
                        </div>
                        <h4 className="fw-bold">2. Κράτηση</h4>
                        <p className="text-muted">Επίλεξε διαθέσιμη ώρα και κλείσε το γήπεδο άμεσα.</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="p-4 rounded-4 bg-light h-100 hover-card transition-all">
                        <div className="d-inline-flex align-items-center justify-content-center bg-white text-primary rounded-circle shadow-sm mb-4" style={{width:80, height:80}}>
                            <i className="bi bi-trophy fs-2"></i>
                        </div>
                        <h4 className="fw-bold">3. Παιχνίδι</h4>
                        <p className="text-muted">Μάζεψε την ομάδα σου και απόλαυσε το παιχνίδι!</p>
                    </div>
                </div>
            </div>
          </div>
      </section>
      <section id="map-section" className="py-5 bg-white">
        <div className="container py-5">
            <div className="text-center mb-5">
                <h6 className="text-primary fw-bold text-uppercase ls-2">Τοποθεσίες</h6>
                <h2 className="fw-bold display-6">Βρες Γήπεδο κοντά σου</h2>
            </div>
            
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                <div style={{ height: "500px", width: "100%" }}>
  <MapContainer 
    key={facilities.length} 
    center={[37.9838, 23.7275]} 
    zoom={12} 
    scrollWheelZoom={false} 
    style={{ height: "100%", width: "100%" }}
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
                    <h6 className="fw-bold mb-1">{f.name}</h6>
                    <p className="small text-muted mb-2">{f.location}</p>
                    <Link to={`/facilities/${f._id}`} className="btn btn-sm btn-primary">Προβολή</Link>
                </div>
            </Popup>
        </Marker>
    );
    })}
  </MapContainer>
</div>
            </div>
        </div>
      </section>

      
      <section id="featured" className="py-5 bg-light">
        <div className="container py-5">
          <div className="d-flex justify-content-between align-items-end mb-5">
             <div>
                <h6 className="text-warning fw-bold text-uppercase ls-2">Top Picks</h6>
                <h2 className="fw-bold display-6 mb-0">Δημοφιλή Γήπεδα</h2>
             </div>

             <Link 
                to="/facilities"
                className="btn btn-outline-dark rounded-pill px-4 fw-bold"
             >
                Προβολή Όλων <i className="bi bi-arrow-right ms-1"></i>
             </Link>

          </div>

          {loading ? (
             <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
          ) : (
            <div className="row g-4">
                {facilities.slice(0, 3).map((f) => (
                    <div className="col-md-4" key={f._id}>
                        <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden hover-scale-img">
                            <div className="bg-dark" style={{
                                height: '200px', 
                                backgroundImage: `url(${f.imageUrl || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&q=80&w=800'})`, 
                                backgroundSize:'cover', 
                                backgroundPosition:'center'
                            }}></div>
                            
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-1">{f.name}</h5>
                                <p className="text-muted small mb-3"><i className="bi bi-geo-alt-fill me-1 text-danger"></i> {f.location || "Αθήνα, Κέντρο"}</p>
                                <p className="card-text text-muted small line-clamp-2">{f.description || "Σύγχρονες εγκαταστάσεις..."}</p>
                            </div>
                            
                            <div className="card-footer bg-white border-0 p-3 pt-0 d-flex flex-column flex-xl-row justify-content-between align-items-center gap-2">
                               <span className="badge bg-success border px-3 py-2 rounded-pill fs-6 w-100 w-xl-auto text-center">
                                    {f.pricePerHour ? `${f.pricePerHour}€ / ώρα` : 'Κατόπιν Επικ.'}
                                </span>
                                <Link to={isLoggedIn ? `/facilities/${f._id}` : "/login"} className="btn btn-sm btn-primary rounded-pill px-4 fw-bold w-100 w-xl-auto">Κράτηση</Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          )}
        </div>
      </section>

      
      <section className="py-5 bg-dark text-white text-center">
          <div className="container py-4">
              <h2 className="fw-bold mb-3">Είσαι έτοιμος να ξεκινήσεις;</h2>
              <p className="lead text-white-50 mb-4 col-lg-8 mx-auto">
                  Γίνε μέλος του MatchHub και διαχειρίσου τις κρατήσεις σου εύκολα, γρήγορα και αποτελεσματικά. κλείσε ευκολα γήπεδο, βρες παίχτες και απόλαυσε το παιχνίδι!
              </p>
              <Link to="/register?role=facility_manager" className="btn btn-warning btn-lg px-5 rounded-pill fw-bold hover-scale text-dark">
                  Γίνε Μέλος
              </Link>
          </div>
      </section>
      <footer className="bg-black text-white-50 py-5">
        <div className="container text-center">
            
            <div>
                <Link to="/contact" className="text-white-50 text-decoration-none mx-2 hover-text-white">Επικοινωνία</Link>
                |
                <Link to="/facilities" className="text-white-50 text-decoration-none mx-2 hover-text-white">Γήπεδα</Link>
            </div>
            <p className="mb-2">&copy; 2025 MatchHub. Developed by Likollari Ardit.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;