import { useState, useEffect } from 'react';
import './Tasks.css';
import './Tasks_adapt.css';

export default function Tasks({ 
  tasks, 
  loading,
  currentTask, 
  editingId,
  onTaskChange,
  onSaveTask,
  onDeleteTask,
  onEditTask,
  onResetForm 
}) {
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const fieldsToValidate = ['title_name', 'description', 'deadline_date', 'estimated_time', 'category', 'assigned_to', 'notes'];

  // Validation fileds rules:
  const validateField = (name, value) => {
    switch (name) {
      case 'title_name':
        if (!value || value.trim() === '') {
          return 'Nazwa zadania jest wymagana';
        } else if (value.length < 3) {
          return 'Nazwa musi mieć co najmniej 3 znaki';
        } else if (value.length > 50) {
          return 'Nazwa nie może przekraczać 50 znaków';
        }
        return null;
        
      case 'description':
        if (value && value.length < 10) {
          return 'Opis musi mieć co najmniej 10 znaków';
        } else if (value && value.length > 500) {
          return 'Opis nie może przekraczać 500 znaków';
        }
        return null;
        
      case 'deadline_date':
        if (value && new Date(value) < new Date().setHours(0, 0, 0, 0)) {
          return 'Termin nie może być w przeszłości';
        }
        return null;
        
      case 'estimated_time':
        if (value && (value < 0 || value > 1000)) {
          return 'Czas musi być między 0 a 1000 godzin';
        }
        return null;
        
      case 'category':
        if(value && value.length < 2) {
          return 'Kategoria musi mieć co najmniej 2 znaki';
        }
        else if (value && value.length > 30) {
          return 'Kategoria nie może przekraczać 30 znaków';
        }
        return null;
        
      case 'assigned_to':
        if (value && value.length < 3) {
          return 'Nazwa osoby musi mieć co najmniej 3 znaki';
        }
        if (value && value.length > 50) {
          return 'Nazwa nie może przekraczać 50 znaków';
        }
        return null;
        
      case 'notes':
        if (value && value.length > 200) {
          return 'Notatki nie mogą przekraczać 200 znaków';
        }
        return null;
        
      default:
        return null;
    }
  };

  // Validation all fields:
  const validateAll = (task) => {
    const errors = {};
    fieldsToValidate.forEach(field => {
      const error = validateField(field, task[field]);
      if (error) { errors[field] = error;}
    });

    return errors;
  };

  const handleFieldChange = (field, value) => {
    const updatedTask = { ...currentTask, [field]: value };
    onTaskChange(updatedTask);

    if (touchedFields[field]) {
      const error = validateField(field, value);
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[field] = error;
        } else {
          delete newErrors[field];
        }
        return newErrors;
      });
    }
  };

  // Validate field on blur
  const handleFieldBlurError = (field) => {
    setTouchedFields(prev => ({
      ...prev,
      [field]: true
    }));

    const error = validateField(field, currentTask[field]);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (error)
        newErrors[field] = error;
      else
        delete newErrors[field];
      
      return newErrors;
    });
  };

  // Field error rendering
  const renderFieldError = (field) => {
    if (validationErrors[field] && touchedFields[field]) {
      return <div className="field-error">{validationErrors[field]}</div>;
    }
    return null;
  };

   // error class for filed
  const getFieldClassName = (field) => {
    return validationErrors[field] && touchedFields[field] ? 'error' : '';
  };

  // Check form before submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const allTouched = {};
    
    fieldsToValidate.forEach(field => {
      allTouched[field] = true;
    });
    setTouchedFields(allTouched);
    
    const errors = validateAll(currentTask);
    setValidationErrors(errors);
    
    // If no errors:
    if (Object.keys(errors).length === 0) {
      onSaveTask(e);
      //Clear validation
      setValidationErrors({});
      setTouchedFields({});
    }
  };

  useEffect(() => {
    if (!editingId) {
      //Clear validation
      setValidationErrors({});
      setTouchedFields({});
    }
  }, [editingId]);


  // Check if there are any errors
  const hasRealErrors = () => {
    return Object.values(validationErrors).some(error => error !== null && error !== undefined);
  };

  return (
    <div className="tasks-container" >
      {/* Formularz zadania */}
      <form onSubmit={handleSubmit} className="task-form" noValidate>
        <h2>{editingId ? '✏️ Edytuj zadanie:' : '➕ Utwórz nowe zadanie'}</h2>

        <div className="form-block">
          <label>Nazwa: *</label>
          <input
            type="text"
            placeholder="Wprowadź nazwę zadania (3-50 znaków)"
            value={currentTask.title_name}
            onChange={(e) => handleFieldChange('title_name', e.target.value)}
            onBlur={() => handleFieldBlurError('title_name')}
            required
            minLength="3"
            maxLength="50"
            className={getFieldClassName('title_name')}
          />
          {renderFieldError('title_name')}
        </div>

        <div className="form-block">
          <label>Opis: </label>
          <textarea
            placeholder="Opisz zadanie (max 500 znaków)"
            value={currentTask.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            onBlur={() => handleFieldBlurError('description')}
            rows="3"
            maxLength="500"
            className={getFieldClassName('description')}
          />
          <div className="char-counter">
            {currentTask.description?.length || 0}/500
          </div>
          {renderFieldError('description')}
        </div>

        <div className="form-row">
          <div className="form-block">
            <label>Termin: </label>
            <input
              type="date"
              value={currentTask.deadline_date}
              onChange={(e) => handleFieldChange('deadline_date', e.target.value)}
              onBlur={() => handleFieldBlurError('deadline_date')}
              min={new Date().toISOString().split('T')[0]}
              className={getFieldClassName('deadline_date')}
            />
            {renderFieldError('deadline_date')}
          </div>
          <div className="form-block">
            <label>Kategoria:</label>
            <input
              type="text"
              placeholder="np.: Praca, Nauka... (max 30 znaków)"
              value={currentTask.category}
              onChange={(e) => onTaskChange({ ...currentTask, category: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-block">
            <label>Status: </label>
            <select
              value={currentTask.status}
              onChange={(e) => onTaskChange({ ...currentTask, status: e.target.value })}
            >
              <option value="pending">⏳ Oczekuje</option>
              <option value="in-progress">🔄 W toku</option>
              <option value="completed">✅ Wykonane</option>
            </select>
          </div>

          <div className="form-block">
            <label>Priorytet: </label>
            <select
              value={currentTask.priority}
              onChange={(e) => onTaskChange({ ...currentTask, priority: e.target.value })}
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
            placeholder="Imię osoby... (max 50 znaków)"
            value={currentTask.assigned_to}
            onChange={(e) => onTaskChange({ ...currentTask, assigned_to: e.target.value })}
          />
        </div>

        <div className="form-row">
          <div className="form-block">
            <label>Przybliżony czas (godziny):</label>
            <input
              type="number"
              min="0"
              placeholder="np.: 3"
              value={currentTask.estimated_time}
              onChange={(e) => onTaskChange({ ...currentTask, estimated_time: e.target.value })}
            />
          </div>

          <div className="form-block">
            <label>Notatki:</label>
            <input
              type="text"
              placeholder="Dodatkowe uwagi (max 200 znaków)"
              value={currentTask.notes}
              onChange={(e) => onTaskChange({ ...currentTask, notes: e.target.value })}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {editingId ? 'Zapisz' : 'Utwórz'}
          </button>
          {editingId && (
            <button type="button" onClick={onResetForm} className="btn-secondary">
              Anuluj
            </button>
          )}
        </div>
      </form>

      {/* Lista zadań */}
      <div className="tasks-list">
        <h2>Moje zadania ({tasks.length})</h2>
        {loading && <div className="loading">Ładowanie...</div>}
        {!loading && tasks.length === 0 && (
          <div className="no-tasks">Brak zadań. Utwórz pierwsze zadanie!</div>
        )}

        <div className="tasks-grid">
          {tasks.map(task => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <h3>{task.title_name}</h3>
                <span className={`priority-badge priority-${task.priority}`}>
                  {task.priority === 'high' && '🔴 Wysoki'}
                  {task.priority === 'medium' && '🟡 Średni'}
                  {task.priority === 'low' && '🟢 Niski'}
                </span>
              </div>

              {task.description && <p className="task-description">{task.description}</p>}

              <div className="task-details">
                <span className={`status-badge status-${task.status}`}>
                  {task.status === 'pending' && '⏳ Oczekuje'}
                  {task.status === 'in-progress' && '🔄 W toku'}
                  {task.status === 'completed' && '✅ Wykonane'}
                </span>

                {task.category && <span className="category">🏷️ {task.category}</span>}
                {task.assigned_to && <span className="assigned">👤 {task.assigned_to}</span>}
                
                {task.estimated_time !== null && task.estimated_time !== undefined &&
                  <span className="estimated">⏱ {task.estimated_time} godz.</span>}
                
                {task.notes && <span className="notes">💬 {task.notes}</span>}
                
                {task.deadline_date && (
                  <span className="deadline-date">
                    📅 {new Date(task.deadline_date).toLocaleDateString('pl-PL')}
                  </span>
                )}
              </div>

              <div className="task-actions">
                <button onClick={() => onEditTask(task)} className="btn-edit">
                  📝 Edytuj
                </button>
                <button onClick={() => onDeleteTask(task.id)} className="btn-delete">
                  🗑️ Usuń
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}