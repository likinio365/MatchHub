import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import './LoginPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    teamName: '',
    facilityId: ''
  });

  const [availableFacilities, setAvailableFacilities] = useState([]);
  const [, setLoadingFacs] = useState(true);


  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const res = await api.get('/facilities/list'); 
        setAvailableFacilities(res.data); 
      } catch (err) {
        console.error("Error fetching facilities:", err.message);
      } finally {
        setLoadingFacs(false);
      }
    };
    fetchFacilities();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
        toast.error("Οι κωδικοί δεν ταιριάζουν!");
        return;
    }

    try {
        await api.post('/users', formData);

        if (formData.role === 'facility_manager') {
            toast.success('Η αίτηση υποβλήθηκε! Αναμένει έγκριση από τον Admin.');
        } else {
            toast.success('Η εγγραφή ολοκληρώθηκε επιτυχώς!');
        }
        
        navigate('/login');

    } catch (error) {
        toast.error(error.response?.data?.message || 'Σφάλμα κατά την εγγραφή');
    }
  };

  return (
    <div className="login-wrapper"> 
      <div className="login-card my-5">
        
        <div className="login-header">
            <h3><i className="bi bi-person-plus-fill me-2"></i>Εγγραφή</h3>
            <p className="mb-0 opacity-75 small">Δημιουργήστε τον λογαριασμό σας</p>
        </div>

        <div className="card-body p-4 p-md-5">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label fw-bold small text-muted text-uppercase">Ρόλος Χρήστη</label>
              <select 
                name="role" 
                className="form-select"
                value={formData.role} 
                onChange={handleChange} 
                required
              >
                <option value="user">Simple User (Απλός Χρήστης)</option>
                <option value="team_manager">Team Manager (Υπεύθυνος Ομάδας)</option>
                <option value="facility_manager">Facility Manager (Υπεύθυνος Εγκατάστασης)</option>
              </select>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="form-floating">
                    <input type="text" name="firstName" className="form-control" onChange={handleChange} placeholder="Όνομα" required />
                    <label>Όνομα</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                    <input type="text" name="lastName" className="form-control" onChange={handleChange} placeholder="Επώνυμο" required />
                    <label>Επώνυμο</label>
                </div>
              </div>
            </div>
            {formData.role === 'team_manager' && (
              <div className="alert alert-info border-0 shadow-sm mb-4">
                <label className="form-label fw-bold small text-uppercase">Όνομα Ομάδας</label>
                <input 
                  type="text" name="teamName" className="form-control"
                  placeholder="π.χ. Α.Ο. Κένταυρος" 
                  onChange={handleChange} required 
                />
              </div>
            )}
            {formData.role === 'facility_manager' && (
              <div className="alert alert-warning border-0 shadow-sm mb-4 text-dark">
                <label className="form-label fw-bold small text-uppercase">Επιλογή Εγκατάστασης</label>
                <select 
                    name="facilityId" 
                    className="form-select mb-2"
                    value={formData.facilityId}
                    onChange={handleChange}
                    required
                >
                    <option value="" disabled>-- Επιλέξτε --</option>
                    {availableFacilities.map((fac) => (
                        <option key={fac._id} value={fac._id}>{fac.name}</option>
                    ))}
                </select>
                <small className="d-block mt-2 fw-bold">
                    <i className="bi bi-exclamation-triangle-fill me-1"></i> Απαιτείται έγκριση Admin.
                </small>
              </div>
            )}
            <div className="form-floating mb-3">
              <input type="email" name="email" className="form-control" onChange={handleChange} placeholder="Email" required />
              <label>Διεύθυνση Email</label>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <div className="form-floating">
                    <input type="password" name="password" className="form-control" onChange={handleChange} placeholder="Κωδικός" required />
                    <label>Κωδικός</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-floating">
                    <input type="password" name="confirmPassword" className="form-control" onChange={handleChange} placeholder="Επιβεβαίωση" required />
                    <label>Επιβεβαίωση</label>
                </div>
              </div>
            </div>

            <div className="d-grid">
              <button type="submit" className="btn btn-primary btn-lg btn-login">Δημιουργία Λογαριασμού</button>
            </div>

          </form>
        </div>

        <div className="card-footer text-center py-3 bg-light border-0">
            <div className="small text-muted">
                Έχετε ήδη λογαριασμό; <Link to="/login" className="text-primary fw-bold text-decoration-none">Σύνδεση</Link>
            </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;