import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import './App_anim.css';
import './App_adapt.css';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
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
  const [error, setError] = useState('');

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


  // GET all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Nie udało się załadować dane.');
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
      setError(error.response?.data?.error || 'Nie zapisano dane.');
    }
  };

  // DELETE Task
  const deleteTask = async (id) => {
    if (!window.confirm('Chcesz napewno usunąć zadanie ?')) return;

    try {
      setError('');
      await axios.delete(`${API_URL}/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Delete error:', error);
      setError('Nie udało się usunąć zadanie.');
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
    setError('');
  };


  return (
    <div className="app">
      <h1>Mój menedżer zadań 📃</h1>

      {error && <div className="error-message">{error}</div>}

      {/* Form tasks */}
      <form onSubmit={saveTask} className="task-form">
        <h2>{editingId ? '✏️ Edytuj zadanie:' : '➕ Stwórz nowe'}</h2>

        <div className="form-block">
          <label>Nazwa: </label>
          <input
            type="text"
            placeholder="Wprowadź nazwę"
            value={currentTask.title_name}
            onChange={(e) => setCurrentTask({ ...currentTask, title_name: e.target.value })}
            required
          />
        </div>

        <div className="form-block">
          <label>Opis: </label>
          <textarea
            placeholder="Opisz zadanie.."
            value={currentTask.description}
            onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
            rows="3"
          />
        </div>

        <div className="form-row">
          <div className="form-block">
            <label>Deadline: </label>
            <input
              type="date"
              value={currentTask.deadline_date}
              onChange={(e) => setCurrentTask({ ...currentTask, deadline_date: e.target.value })}
            />
          </div>
          <div className="form-block">
            <label>Kategoria:</label>
            <input
              type="text"
              placeholder="np. Praca, Nauka..."
              value={currentTask.category}
              onChange={(e) => setCurrentTask({ ...currentTask, category: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-block">
            <label>Status: </label>
            <select
              value={currentTask.status}
              onChange={(e) => setCurrentTask({ ...currentTask, status: e.target.value })}
            >
              <option value="pending">⏳ Oczekuje</option>
              <option value="in-progress">🔄 w procesie</option>
              <option value="completed">✅ Zrobiono</option>
            </select>
          </div>

          <div className="form-block">
            <label>Pryoritet: </label>
            <select
              value={currentTask.priority}
              onChange={(e) => setCurrentTask({ ...currentTask, priority: e.target.value })}
            >
              <option value="low">🟢 Niski</option>
              <option value="medium">🟡 Średni</option>
              <option value="high">🔴 Wysoki</option>
            </select>
          </div>
        </div>

        <div className="form-block">
          <label>Przypisane do:</label>
          <input
            type="text"
            placeholder="Imię osoby..."
            value={currentTask.assigned_to}
            onChange={(e) => setCurrentTask({ ...currentTask, assigned_to: e.target.value })}
          />
        </div>

        <div className="form-row">
          <div className="form-block">
            <label>Szacowany czas:</label>
            <input
              type="number"
              min="0"
              placeholder="Na przykład 3"
              value={currentTask.estimated_time}
              onChange={(e) => setCurrentTask({ ...currentTask, estimated_time: e.target.value })}
            />
          </div>

          <div className="form-block">
            <label>Notatki:</label>
            <input
              type="text"
              placeholder="Dodatkowe uwagi"
              value={currentTask.notes}
              onChange={(e) => setCurrentTask({ ...currentTask, notes: e.target.value })}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {editingId ? 'Zapisz' : 'Stwórz'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="btn-secondary">Reset</button>
          )}
        </div>

      </form>

      <div className="tasks-list">
        <h2>Lista zadań ({tasks.length})</h2>
        {loading && <div className="loading">Ładowanie...</div>}
        {!loading && tasks.length === 0 && (<div className="no-tasks">Niema zadań. Stwórz nowe!</div>)}

        <div className="tasks-grid">
          {tasks.map(task => (
          <div key={task.id} className="task-card">
            <div className="task-header">
              <h3>{task.title_name}</h3>
              <span className={`priority-badge priority-${task.priority}`}>
                {task.priority === 'high' && '🔴'}
                {task.priority === 'medium' && '🟡'}
                {task.priority === 'low' && '🟢'}
                {task.priority}
              </span>
            </div>

            {task.description && <p className="task-description">{task.description}</p>}

            <div className="task-details">
              <span className={`status-badge status-${task.status}`}>
                {task.status === 'pending' && '⏳'}
                {task.status === 'in-progress' && '🔄'}
                {task.status === 'completed' && '✅'}
                {task.status}
              </span>

              {task.category && <span className="category">🏷️ {task.category}</span>}
              {task.assigned_to && <span className="assigned">👤 {task.assigned_to}</span>}
              
              {task.estimated_time !== null && task.estimated_time !== undefined &&
                <span className="estimated">⏱ {task.estimated_time} h.</span>}
              
              {task.notes && <span className="notes">💬 {task.notes}</span>}
              
              {task.deadline_date && (
                <span className="deadline-date">📅 {new Date(task.deadline_date).toLocaleDateString('pl-PL')}</span>
              )}
            </div>

            <div className="task-actions">
              <button onClick={() => editTask(task)} className="btn-edit">📝Edytuj</button>
              <button onClick={() => deleteTask(task.id)} className="btn-delete">🗑️Usuń</button>
            </div>
          </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
