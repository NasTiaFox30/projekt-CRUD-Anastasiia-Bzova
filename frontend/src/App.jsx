import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import './App_anim.css';
import './App_adapt.css';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Home from './components/Home/Home';
import Tasks from './components/Tasks/Tasks';
import Footer from './Footer';

const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/tasks`
  : 'http://localhost:3001/tasks';

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'login', 'register', 'tasks'
  
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState({
    title_name: '',
    description: '',
    deadline_date: '',
    priority: 'medium',
    status: 'pending',
    category: '',
    assigned_to: '',
    estimated_time: '',
    notes: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  // Check for existing token (authorization)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentView('tasks');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentView === 'tasks') { fetchTasks(); }
  }, [isAuthenticated, currentView]);

  // Login functions:
  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentView('tasks');
    setGlobalError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    setTasks([]);
    setCurrentView('home');
    setGlobalError('');
  };

  // Navigation views
  const showHome = () => setCurrentView('home');
  const showLoginView = () => setCurrentView('login');
  const showRegisterView = () => setCurrentView('register');
  const showTasks = () => setCurrentView('tasks');

// TASKS CRUD:
  // GET all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setGlobalError('');
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
      if (error.response?.status === 401) { 
        handleLogout(); 
      } else {
        setGlobalError('Nie udało się załadować dane.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Create/Update Task
  const saveTask = async (e) => {
    e.preventDefault();
    try {
      setError('');
      if (editingId)
        await axios.put(`${API_URL}/${editingId}`, currentTask);
      else
        await axios.post(API_URL, currentTask);

      resetForm();
      fetchTasks();
    } catch (error) {
      console.error('Save error:', error);
      if (error.response?.status === 401) { 
        handleLogout();
      } else if (error.response?.status === 422) {
        // Validation failed
        const fieldErrors = error.response.data.fieldErrors;
        if (fieldErrors && fieldErrors.length > 0) {
          const firstError = fieldErrors[0]?.message;
          setGlobalError(firstError);
        } else {
          setGlobalError('Błąd walidacji danych');
        }
      } else if (error.response?.status === 409) {
        // Conflict validation
        setGlobalError(error.response.data.message);
      } else {
        setGlobalError(error.response?.data?.message || 'Nie zapisano dane.');
      }
    }
  };

  // DELETE Task
  const deleteTask = async (id) => {
    if (!window.confirm('Chcesz napewno usunąć zadanie ?')) return;

    try {
      setGlobalError('');
      await axios.delete(`${API_URL}/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Delete error:', error);
      if (error.response?.status === 401) { 
        handleLogout();
      } else if (error.response?.status === 404) {
        setGlobalError('Zadanie nie zostało znalezione');
      } else {
        setGlobalError('Nie udało się usunąć zadanie.');
      }
    }
  };


  // Edit Task
  const editTask = (task) => {
    setCurrentTask({
      title_name: task.title_name,
      description: task.description || '',
      deadline_date: task.deadline_date || '',
      priority: task.priority,
      status: task.status,
      category: task.category || '',
      assigned_to: task.assigned_to || '',
      estimated_time: task.estimated_time ?? '',
      notes: task.notes || ''
    });
    setEditingId(task.id);
  };

  // Reset Form Task
  const resetForm = () => {
    setCurrentTask({
      title_name: '',
      description: '',
      deadline_date: '',
      priority: 'medium',
      status: 'pending',
      category: '',
      assigned_to: '',
      estimated_time: '',
      notes: ''
    });
    setEditingId(null);
    setGlobalError('');
  };

  // Change handler Task
  const handleTaskChange = (updatedTask) => {
    setCurrentTask(updatedTask);
  };

  // Not authenticated user view
  if (!isAuthenticated) {
    return (
      <div className="app">
        <header className="app-header">
          <h1 onClick={showHome}>Menadżer Zadań 📃</h1>
          <nav className="nav-buttons">
            <button 
              onClick={showLoginView} 
              className={`nav-btn ${currentView === 'login' ? 'active' : ''}`}
            >
              Zaloguj się
            </button>
            <button 
              onClick={showRegisterView} 
              className={`nav-btn ${currentView === 'register' ? 'active' : ''}`}
            >
              Rejestracja
            </button>
          </nav>
        </header>

        <main>
          {currentView === 'home' && <Home />}
          {currentView === 'login' && (
            <Login onLogin={handleLogin} onSwitchToRegister={showRegisterView} />
          )}
          {currentView === 'register' && (
            <Register onRegister={handleLogin} onSwitchToLogin={showLoginView} />
          )}
          {currentView === 'home' && (
            <div className="auth-prompt">
              <p>Zaloguj się lub zarejestruj, aby rozpocząć korzystanie z aplikacji!</p>
              <div className="auth-prompt-buttons">
                <button onClick={showLoginView} className="btn-primary">Zaloguj się</button>
                <button onClick={showRegisterView} className="btn-secondary">Zarejestruj się</button>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    );
  }

  // Authenticated user view
  return (
    <div className="app">
      <header className="app-header">
        <h1 onClick={showHome} style={{cursor: 'pointer'}}>Menadżer Zadań 📃</h1>
        <nav className="nav-buttons">
          <button 
            onClick={showTasks} 
            className={`nav-btn ${currentView === 'tasks' ? 'active' : ''}`}
          >
            Moje zadania ({tasks.length})
          </button>
          <div className="user-info">
            <span>Witaj, {user?.login}!</span>
            <button onClick={handleLogout} className="logout-btn">Wyloguj się</button>
          </div>
        </nav>
      </header>

      <main>
        {currentView === 'home' && <Home />}
        {currentView === 'tasks' && (
          <Tasks 
            tasks={tasks}
            loading={loading}
            currentTask={currentTask}
            editingId={editingId}
            onTaskChange={handleTaskChange}
            onSaveTask={saveTask}
            onDeleteTask={deleteTask}
            onEditTask={editTask}
            onResetForm={resetForm}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
