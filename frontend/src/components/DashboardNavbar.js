import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios'; 
import socket from '../api/socket'; 
import logo from '../assets/logo.png'; 

const DashboardNavbar = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const userId = localStorage.getItem('userId'); 

  useEffect(() => {
    if (!userId) return;
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/notifications');
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      } catch (error) {
        console.error("Error fetching notifications:", error.message);
      }
    };
    fetchNotifications();


    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join', userId);


    socket.on('new_notification', (notif) => {
      setNotifications(prev => [notif, ...prev].slice(0, 20));
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket.off('new_notification');
    };
  }, [userId]);

  const handleLogout = () => {
    localStorage.clear();
    socket.disconnect();
    navigate('/');
  };

  const handleMarkAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await api.put('/notifications/read-all', {});
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking notifications as read:", error.message);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4 shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
          <img 
            src={logo} 
            alt="MatchHub Logo" 
            style={{ height: '35px', marginRight: '10px' }} 
          />
          MatchHub
        </Link>

        <div className="d-flex align-items-center gap-3 ms-auto order-lg-last">
          

          <div className="dropdown">
            <button 
              className="btn btn-transparent border-0 position-relative p-1 text-white" 
              type="button" 
              data-bs-toggle="dropdown" 
              onClick={handleMarkAsRead}
            >
              <i className="bi bi-bell-fill fs-5"></i>
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light" style={{ fontSize: '0.65rem' }}>
                  {unreadCount}
                </span>
              )}
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 py-0 overflow-hidden rounded-3" style={{ width: '300px', fontSize: '0.9rem' }}>
              <li className="bg-light p-2 border-bottom fw-bold text-center">Ειδοποιήσεις</li>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <li className="p-3 text-center text-muted">Δεν υπάρχουν ειδοποιήσεις</li>
                ) : (
                  notifications.map(n => (
                    <li key={n._id} className={`p-3 border-bottom notification-item ${!n.isRead ? 'bg-light fw-bold' : ''}`} style={{ borderLeft: !n.isRead ? '4px solid #0d6efd' : 'none' }}>
                      <div className="mb-1">{n.message}</div>
                      <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                        <i className="bi bi-clock me-1"></i>
                        {new Date(n.createdAt).toLocaleString('el-GR')}
                      </small>
                    </li>
                  ))
                )}
              </div>
              <li className="text-center p-2 bg-white border-top">
                <small className="text-primary fw-bold" style={{ cursor: 'pointer' }}>Προβολή όλων</small>
              </li>
            </ul>
          </div>

          <div className="dropdown">
            <button className="btn btn-light btn-sm dropdown-toggle fw-bold px-3 rounded-pill d-flex align-items-center gap-2" type="button" id="userMenu" data-bs-toggle="dropdown">
              <i className="bi bi-person-circle"></i>
              <span className="d-none d-md-inline">Λογαριασμός</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 rounded-3" aria-labelledby="userMenu">
              <li>
                <button className="dropdown-item text-danger d-flex align-items-center gap-2 py-2" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right"></i>Αποσύνδεση
                </button>
              </li>
            </ul>
          </div>
        </div>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#dashboardNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="dashboardNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link active fw-semibold" to="/">Αρχική</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;