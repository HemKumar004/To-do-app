import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:3000/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('Work');
  const [description, setDescription] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [editingTask, setEditingTask] = useState(null);
  const [settingReminderFor, setSettingReminderFor] = useState(null);
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');
  const [reminderError, setReminderError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [apiError, setApiError] = useState('');

  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);

  const titles = ['Work', 'Personal', 'Shopping', 'Study'];
  const priorities = ['Low', 'Medium', 'High'];

  const fetchTasks = async () => {
    try {
      const res = await axios.get(API_URL);
      setTasks(res.data);
      setApiError('');
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setApiError('Failed to fetch tasks. Please try again later.');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setDescriptionError('Description is required.');
      return;
    }

    setDescriptionError('');
    const payload = {
      title,
      description,
      reminderDate: reminderDate.trim() === '' ? null : reminderDate,
      reminderTime: reminderTime.trim() === '' ? null : reminderTime,
      priority,
      isFinished: editingTask ? editingTask.isFinished : false,
    };

    try {
      if (editingTask) {
        await axios.put(`${API_URL}/${editingTask.id}`, payload);
        setEditingTask(null);
      } else {
        await axios.post(API_URL, payload);
      }

      setTitle('Work');
      setDescription('');
      setReminderDate('');
      setReminderTime('');
      setPriority('Medium');
      setApiError('');
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      setApiError('Failed to save task. Please try again.');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setReminderDate(task.reminderDate || '');
    setReminderTime(task.reminderTime || '');
    setPriority(task.priority || 'Medium');
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setApiError('');
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      setApiError('Failed to delete task. Please try again.');
    }
  };

  const handleSetReminderClick = (task) => {
    setSettingReminderFor(task.id);
    setNewReminderDate(task.reminderDate || '');
    setNewReminderTime(task.reminderTime || '');
    setReminderError('');
  };

  const validateReminder = (date, time) => {
    if (!date || !time) return false;
    const selected = new Date(`${date}T${time}`);
    const now = new Date();
    return selected > now;
  };

  const handleSaveReminder = async (taskId) => {
    if (!validateReminder(newReminderDate, newReminderTime)) {
      setReminderError('Reminder date and time must be in the future.');
      return;
    }

    setReminderError('');
    const payload = {
      reminderDate: newReminderDate.trim() === '' ? null : newReminderDate,
      reminderTime: newReminderTime.trim() === '' ? null : newReminderTime
    };

    try {
      await axios.put(`${API_URL}/${taskId}`, payload);
      setSettingReminderFor(null);
      setApiError('');
      fetchTasks();
    } catch (error) {
      console.error('Error saving reminder:', error);
      setApiError('Failed to save reminder. Please try again.');
    }
  };

  const toggleFinished = async (task) => {
    try {
      await axios.put(`${API_URL}/${task.id}`, {
        ...task,
        isFinished: !task.isFinished
      });
      fetchTasks();
    } catch (error) {
      console.error('Failed to toggle finished status:', error);
      setApiError('Could not update task status.');
    }
  };

  // Dark mode toggle handler
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div className={`container ${darkMode ? 'dark' : 'light'}`}>
      <div className="header">
        <h1 className="heading">CONTACT MANAGER</h1>
        <button onClick={toggleDarkMode} className="buttonPrimary toggleDarkBtn" aria-label="Toggle dark mode">
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      {apiError && <div className="errorText">{apiError}</div>}

      <form onSubmit={handleSubmit} className="form">
        <label className="label">
          Title:
          <select
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="select"
          >
            {titles.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label className="label">
          Description:
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="inputText"
            placeholder="Enter task description"
          />
        </label>
        {descriptionError && <div className="errorText">{descriptionError}</div>}

        <label className="label">
          Priority:
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="select"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>

        <button type="submit" className="buttonPrimary" style={{ marginTop: '20px' }}>
          {editingTask ? 'Update Task' : 'Add Task'}
        </button>
      </form>

      <ul className="taskList">
        {tasks.map((task) => (
          <li key={task.id} className="taskItem">
            <div className="taskTitle">
              {task.title} - <strong>{task.priority}</strong>
            </div>
            <div>{task.description}</div>
            <div>Status: {task.isFinished ? '✅ Finished' : '⏳ Incomplete'}</div>
            {task.reminderDate && task.reminderTime && (
              <div className="reminderText">
                ⏰ {new Date(task.reminderDate).toLocaleDateString()} at {task.reminderTime}
              </div>
            )}

            <div className="buttonGroup">
              <button onClick={() => handleEdit(task)} className="buttonEdit">Edit</button>
              <button onClick={() => handleDelete(task.id)} className="buttonDelete">Delete</button>
              <button onClick={() => handleSetReminderClick(task)} className="buttonReminder">Set Reminder</button>
              <button onClick={() => toggleFinished(task)} className="buttonToggle">
                {task.isFinished ? 'Mark Incomplete' : 'Mark Finished'}
              </button>
            </div>

            {settingReminderFor === task.id && (
              <div className="reminderBox">
                <label className="reminderInputLabel">
                  New Date:
                  <input
                    type="date"
                    value={newReminderDate}
                    onChange={(e) => setNewReminderDate(e.target.value)}
                    className="reminderInput"
                  />
                </label>
                <label className="reminderInputLabel">
                  New Time:
                  <input
                    type="time"
                    value={newReminderTime}
                    onChange={(e) => setNewReminderTime(e.target.value)}
                    className="reminderInput"
                  />
                </label>
                {reminderError && <div className="errorText">{reminderError}</div>}
                <button onClick={() => handleSaveReminder(task.id)} className="buttonPrimary" style={{ marginTop: '10px' }}>
                  Save Reminder
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
