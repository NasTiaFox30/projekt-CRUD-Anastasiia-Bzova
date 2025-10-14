import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:3001/tasks';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState({
    title_name: '',
    description: '',
    deadline_date: '',
    priority: 'medium',
    status: 'pending'
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      
      fetchTasks();
    } catch (error) {
      console.error('Fetch error:', error);
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
      console.error('Error delete task:', error);
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
      status: task.status
    });
    setEditingId(task.id);
  };

  return (
    <div className="app">
      <h1>Mój menedżer zadań 📃</h1>
      
      {error && <div className="error-message">{error}</div>}

      {/* Task List */}
      <div className="tasks-list">
        <h2>Lista zadań ({tasks.length})</h2>
        
        {loading && <div className="loading">Ładowanie...</div>}
        
        {!loading && tasks.length === 0 && (
          <div className="no-tasks">Niema zadań. Stwórz nowe!</div>
        )}

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
            
            {task.description && (
              <p className="task-description">{task.description}</p>
            )}
            
            <div className="task-details">
              <span className={`status-badge status-${task.status}`}>
                {task.status === 'pending' && 'Peding ⏳'}
                {task.status === 'in-progress' && 'In-progress 🔄'}
                {task.status === 'completed' && 'Complete ✅'}
                {task.status}
              </span>

              <span className="created-date">
                🕐 {new Date(task.created_date).toLocaleDateString('pl-PL')}
              </span>
              {task.deadline_date && (
                <span className="deadline-date">
                  📅 {new Date(task.deadline_date).toLocaleDateString('pl-PL')}
                </span>
              )}
            </div>
            
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}