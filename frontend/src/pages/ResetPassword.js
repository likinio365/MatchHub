import React, { useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import './LoginPage.css';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { resetToken } = useParams(); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            return toast.error("Οι κωδικοί δεν ταιριάζουν");
        }

        try {
            await api.put(`/users/resetpassword/${resetToken}`, { password });
            toast.success("Ο κωδικός άλλαξε επιτυχώς! Μπορείτε να συνδεθείτε.");
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || "Ο σύνδεσμος έχει λήξει ή δεν είναι έγκυρος.");
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card shadow p-0">
                
                <div className="login-header text-center">
                    <h3><i className="bi bi-shield-lock-fill me-2"></i>Νέος Κωδικός</h3>
                    <p className="mb-0 opacity-75 small">Ορίστε τον νέο σας κωδικό πρόσβασης</p>
                </div>

                <div className="card-body p-4 p-md-5">
                    <form onSubmit={handleSubmit}>
                        <div className="form-floating mb-3">
                            <input 
                                type="password" 
                                className="form-control" 
                                id="newPassword"
                                placeholder="Νέος Κωδικός"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                            <label htmlFor="newPassword">Νέος Κωδικός</label>
                        </div>

                        <div className="form-floating mb-4">
                            <input 
                                type="password" 
                                className="form-control" 
                                id="confirmPassword"
                                placeholder="Επιβεβαίωση"
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                required 
                            />
                            <label htmlFor="confirmPassword">Επιβεβαίωση Κωδικού</label>
                        </div>

                        <div className="d-grid">
                            <button type="submit" className="btn btn-success btn-lg btn-login">
                                Αλλαγή Κωδικού
                            </button>
                        </div>
                    </form>
                </div>

                <div className="card-footer text-center py-3 bg-light border-0">
                    <div className="small">
                        <button 
                            onClick={() => navigate('/login')} 
                            className="btn btn-link btn-sm text-decoration-none text-muted"
                        >
                            Επιστροφή στη Σύνδεση
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;