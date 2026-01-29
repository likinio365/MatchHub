import React, { useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import './LoginPage.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/forgotpassword', { email });
            toast.success("Ελέγξτε το email σας για τις οδηγίες επαναφοράς!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Κάτι πήγε στραβά. Δοκιμάστε ξανά.");
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card shadow p-0">
                
                <div className="login-header text-center">
                    <h3><i className="bi bi-patch-question-fill me-2"></i>Επαναφορά</h3>
                    <p className="mb-0 opacity-75 small">Ξεχάσατε τον κωδικό σας;</p>
                </div>

                <div className="card-body p-4 p-md-5">
                    <p className="text-muted text-center small mb-4">
                        Συμπληρώστε το email σας και θα σας στείλουμε έναν σύνδεσμο για να ορίσετε νέο κωδικό.
                    </p>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-floating mb-4">
                            <input 
                                type="email" 
                                className="form-control" 
                                id="forgotEmail"
                                placeholder="name@example.com"
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                            <label htmlFor="forgotEmail">Διεύθυνση Email</label>
                        </div>

                        <div className="d-grid">
                            <button type="submit" className="btn btn-primary btn-lg btn-login">
                                Αποστολή Συνδέσμου
                            </button>
                        </div>
                    </form>
                </div>

                <div className="card-footer text-center py-3 bg-light border-0">
                    <div className="small">
                        <Link to="/login" className="text-decoration-none fw-bold text-primary">
                            <i className="bi bi-arrow-left me-1"></i>Πίσω στη Σύνδεση
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;