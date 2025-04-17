import './App.css';

import React, { useState, useEffect } from 'react';

function App() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Meeting');
  const [recurring, setRecurring] = useState('None');
  const [editingId, setEditingId] = useState(null);

  const today = new Date();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('events'));
    if (saved) setEvents(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  const resetForm = () => {
    setTitle('');
    setDate('');
    setTime('');
    setLocation('');
    setDescription('');
    setType('Meeting');
    setRecurring('None');
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!title || !date || !time) return;

    const baseEvent = {
      id: editingId || Date.now(),
      title,
      date,
      time,
      location,
      description,
      type,
      done: false,
      recurring,
    };

    if (editingId) {
      setEvents(events.map(e => (e.id === editingId ? baseEvent : e)));
    } else {
      const newEvents = [baseEvent];

      if (recurring === 'Daily') {
        for (let i = 1; i < 5; i++) {
          const newDate = new Date(date);
          newDate.setDate(newDate.getDate() + i);
          newEvents.push({
            ...baseEvent,
            id: Date.now() + i,
            date: newDate.toISOString().split('T')[0],
          });
        }
      }

      if (recurring === 'Weekly') {
        for (let i = 1; i < 5; i++) {
          const newDate = new Date(date);
          newDate.setDate(newDate.getDate() + i * 7);
          newEvents.push({
            ...baseEvent,
            id: Date.now() + i,
            date: newDate.toISOString().split('T')[0],
          });
        }
      }

      setEvents([...events, ...newEvents]);
    }

    resetForm();
  };

  const handleEdit = (event) => {
    setTitle(event.title);
    setDate(event.date);
    setTime(event.time);
    setLocation(event.location);
    setDescription(event.description);
    setType(event.type);
    setRecurring(event.recurring || 'None');
    setEditingId(event.id);
  };

  const handleDelete = (id) => {
    setEvents(events.filter(event => event.id !== id));
  };

  const handleToggleDone = (id) => {
    setEvents(events.map(event =>
      event.id === id ? { ...event, done: !event.done } : event
    ));
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Birthday': return '🎉';
      case 'Meeting': return '📅';
      case 'Reminder': return '⏰';
      case 'Shopping': return '🛍';
      default: return '📌';
    }
  };

  const isSameDate = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();

  const calendarDays = () => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const totalDays = getDaysInMonth(year, month);
    const firstDay = new Date(year, month, 1).getDay();

    const days = Array(firstDay).fill(null);
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const sortedEvents = [...events].sort((a, b) =>
    new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
  );

  return (
    <div className="container">

      <h1>📅 Event Planner</h1>

      {/* Form */}
      <div style={{
        border: '1px solid #ccc',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        maxWidth: '400px'
      }}>
        <h2>{editingId ? 'Edit Event ✏️' : 'Add New Event ➕'}</h2>

        <input
          type="text" placeholder="Event Title" value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ display: 'block', marginBottom: '10px', width: '100%' }}
        />

        <input
          type="date" value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ display: 'block', marginBottom: '10px', width: '100%' }}
        />

        <input
          type="time" value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{ display: 'block', marginBottom: '10px', width: '100%' }}
        />

        <input
          type="text" placeholder="Location" value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{ display: 'block', marginBottom: '10px', width: '100%' }}
        />

        <textarea
          placeholder="Description" value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          style={{ display: 'block', marginBottom: '10px', width: '100%' }}
        ></textarea>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ display: 'block', marginBottom: '10px', width: '100%' }}
        >
          <option value="Meeting">Meeting</option>
          <option value="Birthday">Birthday</option>
          <option value="Reminder">Reminder</option>
          <option value="Shopping">Shopping</option>
        </select>

        <select
          value={recurring}
          onChange={(e) => setRecurring(e.target.value)}
          style={{ display: 'block', marginBottom: '10px', width: '100%' }}
        >
          <option value="None">No Repeat</option>
          <option value="Daily">Repeat Daily</option>
          <option value="Weekly">Repeat Weekly</option>
        </select>

        <button onClick={handleSubmit}>
          {editingId ? 'Update Event' : 'Add Event'}
        </button>
      </div>

      {/* Calendar View */}
      <h2>📆 Calendar (This Month)</h2>
      <div className="calendar">
        {calendarDays().map((day, idx) => (
          <div
            key={idx}
            className={`calendar-day ${day && events.some(e => isSameDate(new Date(e.date), day)) ? 'has-event' : ''}`}
          >
            {day ? day.getDate() : ''}
          </div>
        ))}
      </div>

      {/* Event List */}
      <h2>📋 Upcoming Events</h2>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {sortedEvents.map(event => (
          <li
            key={event.id}
            className={`event-item ${event.done ? 'done' : ''}`}
          >
            <strong>{getTypeIcon(event.type)} {event.title}</strong> <br />
            📅 {event.date} ⏰ {event.time} <br />
            📍 {event.location || 'No location'} <br />
            📝 {event.description || 'No description'} <br />
            🔁 {event.recurring} <br />
            <div className="event-buttons">
              <button onClick={() => handleToggleDone(event.id)}>✔️ Done</button>
              <button onClick={() => handleEdit(event)}>✏️ Edit</button>
              <button onClick={() => handleDelete(event.id)}>🗑 Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
