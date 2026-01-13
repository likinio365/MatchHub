import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './LoginPage.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const { email, password } = formData;

    const { login } = useAuth(); 

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        
        try {

            const userData = await login(email, password); 
            const userId = userData._id || (userData.user && userData.user._id);

            if (userId) {
                localStorage.setItem('userId', userId);
            } else {
                console.warn("ΠΡΟΣΟΧΗ: Δεν βρέθηκε User ID στο login response!");
            }

            if (!userData || (!userData.role && !userData.user?.role)) {
                 toast.error("Σφάλμα: Δεν βρέθηκε ρόλος χρήστη.");
                 return;
            }


            const rawRole = userData.role || userData.user.role;
            const role = rawRole.toLowerCase().trim();

            switch (role) {
                case 'admin':
                    toast.success('Καλωσήρθατε Admin!');
                    navigate('/admin-dashboard');
                    break;
                
                case 'team manager':
                    toast.success('Καλωσήρθατε Team Manager!');
                    navigate('/team-dashboard');
                    break;

                case 'facility manager':
                    toast.success('Διαχείριση Εγκαταστάσεων');
                    navigate('/manager-dashboard');
                    break;

                case 'user':
                default:
                    toast.success('Επιτυχής Σύνδεση!');
                    navigate('/user-dashboard');
                    break;
            }

        } catch (error) {
            console.error("Login Error:", error);
            const message = error.response && error.response.data && error.response.data.message
                ? error.response.data.message 
                : "Λάθος email ή κωδικός πρόσβασης.";
            toast.error(message);
        }
    };

    return (

        <div className="login-wrapper">
            <div className="login-card">
                
               
                <div className="login-header">
                    <h3>Καλωσήρθατε</h3>
                    <p>Συνδεθείτε στον λογαριασμό σας</p>
                </div>

                <div className="card-body">
                    <form onSubmit={onSubmit}>
                        
                       
                        <div className="mb-4">
                            <label htmlFor="inputEmail" className="form-label">Email</label>
                            <input
                                className="form-control"
                                id="inputEmail"
                                type="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        
                        <div className="mb-4">
                            <label htmlFor="inputPassword" className="form-label">Κωδικός Πρόσβασης</label>
                            <input
                                className="form-control"
                                id="inputPassword"
                                type="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                placeholder="Εισάγετε τον κωδικό σας"
                                required
                            />
                        </div>
                        <div className="d-flex justify-content-end mb-3">
                             <Link to="/forgot-password" style={{ textDecoration: 'none', fontSize: '0.85rem', color: '#667eea', fontWeight: '500' }}>
                                Ξέχασα τον κωδικό μου;
                            </Link>
                        </div>
                        <div className="text-center mt-4">
                            <button className="btn btn-login" type="submit">
                                Είσοδος
                            </button>
                        </div>
                    </form>
                    <div className="auth-links">
                        <p className="mb-0 text-muted">
                            Δεν έχετε λογαριασμό; <Link to="/register">Εγγραφείτε εδώ</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;