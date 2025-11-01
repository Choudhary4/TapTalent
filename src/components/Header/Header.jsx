import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Settings as SettingsIcon, LogOut, User } from 'lucide-react';
import { toggleUnit } from '../../store/slices/settingsSlice';
import { setUser, logout } from '../../store/slices/authSlice';
import './Header.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Header = () => {
  const dispatch = useDispatch();
  const unit = useSelector((state) => state.settings.unit);
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const handleUnitToggle = () => {
    dispatch(toggleUnit());
  };

  const handleGoogleSuccess = (credentialResponse) => {
    // Decode JWT to get user info
    const decoded = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
    dispatch(
      setUser({
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      })
    );
  };

  const handleGoogleError = () => {
    console.error('Google Sign-In failed');
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <SettingsIcon className="settings-icon" size={24} />
          <h2>Weather Analytics</h2>
        </div>

        <div className="header-right">
          <div className="unit-toggle">
            <button
              className={`unit-btn ${unit === 'metric' ? 'active' : ''}`}
              onClick={handleUnitToggle}
            >
              °C
            </button>
            <button
              className={`unit-btn ${unit === 'imperial' ? 'active' : ''}`}
              onClick={handleUnitToggle}
            >
              °F
            </button>
          </div>

          {GOOGLE_CLIENT_ID ? (
            <div className="auth-section">
              {isAuthenticated ? (
                <div className="user-profile">
                  {user?.picture ? (
                    <img src={user.picture} alt={user.name} className="user-avatar" />
                  ) : (
                    <User size={24} />
                  )}
                  <span className="user-name">{user?.name}</span>
                  <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="filled_blue"
                    size="medium"
                    text="signin_with"
                    shape="rectangular"
                  />
                </GoogleOAuthProvider>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Header;
