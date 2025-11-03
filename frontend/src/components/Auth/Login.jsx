import { useState } from 'react';
import axios from 'axios';
import './Auth.css';
import './Auth_adapt.css';

const API_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:3001';

export default function Login({ onLogin, onSwitchToRegister }) {
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/login`, formData);
      const { token, user } = response.data;
      
      // Zapisujemy token w localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Ustawiamy nagłówek dla przyszłych żądań
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      onLogin(user);
    } catch (error) {
      setError(error.response?.data?.error || 'Błąd logowania');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Logowanie</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Login:</label>
            <input
              type="text"
              name="login"
              value={formData.login}
              onChange={handleChange}
              required
              placeholder="Wprowadź swój login"
            />
          </div>
          
          <div className="form-group">
            <label>Hasło:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Wprowadź swoje hasło"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary auth-btn"
            disabled={loading}
          >
            {loading ? 'Logowanie...' : 'Zaloguj'}
          </button>
        </form>
        
        <div className="auth-switch">
          <p>Nie masz jeszcze konta? 
            <button onClick={onSwitchToRegister} className="link-btn">
              Zarejestruj się
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}