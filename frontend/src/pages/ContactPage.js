import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import api from '../api/axios';

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        await api.post('/public/contact', formData);
        setLoading(false);
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
        console.error(error);
        setLoading(false);
        alert('Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.');
    }
};

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
        <div className="container">
          <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
             <img src={logo} alt="MatchHub Logo" style={{ height: '35px', marginRight: '10px' }} />
             MatchHub
          </Link>
          <button className="btn btn-outline-light btn-sm rounded-pill px-3" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-2"></i> Πίσω
          </button>
        </div>
      </nav>

      
      <div className="container py-5 flex-grow-1">
        <div className="row justify-content-center">
            

            <div className="col-12 text-center mb-5">
                <h6 className="text-primary fw-bold text-uppercase ls-2">Εξυπηρετηση</h6>
                <h2 className="fw-bold display-5">Επικοινώνησε μαζί μας</h2>
                <p className="text-muted col-md-8 mx-auto">
                    Έχεις απορίες για την πλατφόρμα; Θέλεις να καταχωρήσεις το γήπεδό σου; 
                    Η ομάδα του MatchHub είναι εδώ για να σε βοηθήσει.
                </p>
            </div>

            <div className="col-lg-10">
                <div className="row g-0 shadow-lg rounded-4 overflow-hidden bg-white">
                    
                    <div className="col-md-5 bg-dark text-white p-5 d-flex flex-column justify-content-between position-relative">
                        <div className="position-absolute top-0 start-0 w-100 h-100" style={{opacity: 0.1, backgroundImage: 'radial-gradient(circle at top right, #0d6efd, transparent)'}}></div>

                        <div className="position-relative z-1">
                            <h3 className="fw-bold mb-4">Στοιχεία Επικοινωνίας</h3>
                            
                            <div className="d-flex mb-4">
                                <div className="me-3 text-warning"><i className="bi bi-geo-alt-fill fs-4"></i></div>
                                <div>
                                    <h6 className="fw-bold mb-1">Διεύθυνση</h6>
                                    <p className="text-white-50 small mb-0">Λεωφόρος Κηφισίας 100,<br/>Αθήνα, 11526</p>
                                </div>
                            </div>

                            <div className="d-flex mb-4">
                                <div className="me-3 text-warning"><i className="bi bi-envelope-fill fs-4"></i></div>
                                <div>
                                    <h6 className="fw-bold mb-1">Email</h6>
                                    <p className="text-white-50 small mb-0">matchhubsuport@gmail.com</p>
                                </div>
                            </div>

                            <div className="d-flex mb-4">
                                <div className="me-3 text-warning"><i className="bi bi-telephone-fill fs-4"></i></div>
                                <div>
                                    <h6 className="fw-bold mb-1">Τηλέφωνο</h6>
                                    <p className="text-white-50 small mb-0">+30 210 1234567</p>
                                </div>
                            </div>
                        </div>

                        <div className="position-relative z-1">
                            <h6 className="fw-bold mb-3">Social Media</h6>
                            <div className="d-flex gap-3">
                                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-white hover-scale">
                                    <i className="bi bi-facebook fs-5"></i>
                                </a>
                                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-white hover-scale">
                                    <i className="bi bi-instagram fs-5"></i>
                                </a>
                                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-white hover-scale">
                                    <i className="bi bi-linkedin fs-5"></i>
                                </a>
                            </div>
                        </div>
                    </div>


                    <div className="col-md-7 p-5">
                        {submitted ? (
                            <div className="h-100 d-flex flex-column justify-content-center align-items-center text-center fade-in-up">
                                <div className="mb-3 text-success">
                                    <i className="bi bi-check-circle-fill" style={{fontSize: '4rem'}}></i>
                                </div>
                                <h3 className="fw-bold">Το μήνυμα εστάλη!</h3>
                                <p className="text-muted">Ευχαριστούμε για την επικοινωνία. Θα απαντήσουμε το συντομότερο δυνατό.</p>
                                <button className="btn btn-outline-primary rounded-pill mt-3" onClick={() => setSubmitted(false)}>
                                    Νέο Μήνυμα
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <h4 className="fw-bold mb-4 text-primary">Στείλε μας μήνυμα</h4>
                                
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted">Ονοματεπώνυμο</label>
                                        <input 
                                            type="text" name="name" className="form-control bg-light border-0 py-2" required 
                                            value={formData.name} onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted">Email</label>
                                        <input 
                                            type="email" name="email" className="form-control bg-light border-0 py-2" required 
                                            value={formData.email} onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-muted">Θέμα</label>
                                        <input 
                                            type="text" name="subject" className="form-control bg-light border-0 py-2" required 
                                            value={formData.subject} onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-muted">Μήνυμα</label>
                                        <textarea 
                                            name="message" className="form-control bg-light border-0 py-2" rows="4" required
                                            value={formData.message} onChange={handleChange}
                                        ></textarea>
                                    </div>
                                    <div className="col-12 mt-4">
                                        <button type="submit" className="btn btn-primary w-100 py-2 rounded-pill fw-bold shadow-sm" disabled={loading}>
                                            {loading ? (
                                                <> <span className="spinner-border spinner-border-sm me-2"></span> Αποστολή... </>
                                            ) : (
                                                <> Αποστολή Μηνύματος <i className="bi bi-send-fill ms-2"></i> </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>

                </div>
            </div>
        </div>
      </div>

      <footer className="bg-white py-3 border-top text-center text-muted small">
         MatchHub &copy; 2025 - All Rights Reserved.
      </footer>
    </div>
  );
};

export default ContactPage;