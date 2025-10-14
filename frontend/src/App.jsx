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
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Nie udało się załadować dane.');
    }
  };


  return (
    <div className="app">
      <h1>Lista zadań 📃</h1>
      
    </div>
  );
}