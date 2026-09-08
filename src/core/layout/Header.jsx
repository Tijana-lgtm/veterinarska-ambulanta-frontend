import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserContext from '../../UserContext';
import '../../core/global.scss';
import './layout.scss';

const Header = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const userRole = user?.role || user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  const canManagePatients = userRole === 'Veterinar' || userRole === 'Pomocnik';

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <header className="header">
      <nav>
        <div className="nav-links">
          <Link to="/">Početna</Link>
          {canManagePatients && <Link to="/patients">Pacijenti</Link>}
          <span style={{'flexGrow':1}}></span>
          {!user && (
            <>
              <Link to="/login">Prijava</Link>
              <Link to="/register">Registracija</Link>
            </>
          )}

          {user && (
            <>
              <Link to="/profile">
                Profil <small>({user.sub || user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']}{user.role || user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ? ` - ${user.role || user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']}` : ''})</small>
              </Link>
              <button onClick={handleLogout} className="btn btn-danger">
                Odjavi se
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;