import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserContext from './UserContext';
import Header from './core/layout/Header';
import Home from './core/layout/Home';
import Login from './features/users/Login';
import Register from './features/users/Register';
import Profile from './features/users/Profile';
import PatientList from './features/patients/PatientList';
import PatientForm from './features/patients/PatientForm';
import AppointmentSchedule from './features/appointments/AppointmentSchedule';
import './core/global.scss';
import VetAppointments from './features/appointments/VetAppointments';

const App = () => {
  let token = localStorage.getItem('token');
  if(token) token = JSON.parse(atob(token.split('.')[1]));
  const [user, setUser] = useState(token);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <Header />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/patients" element={<PatientList />} />
            <Route path="/patients/new" element={<PatientForm />} />
            <Route path="/patients/:id/edit" element={<PatientForm />} />
            <Route path="/appointments/schedule" element={<AppointmentSchedule />} />
            <Route path="/appointments/my" element ={<VetAppointments/>} />
          </Routes>
        </div>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;