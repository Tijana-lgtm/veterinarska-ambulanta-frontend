import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getUpcomingAppointments, createAppointment } from './services/appointmentService';
import { getVets, getPatients } from '../patients/services/patientService';
import '../../core/global.scss';
import './appointments.scss';

const groupByDay = (appointments) => {
  const groups = {};

  for (let i = 0; i < appointments.length; i++) {
    const appointment = appointments[i];
    const dayLabel = formatDay(appointment.startTime);

    if (!groups[dayLabel]) {
      groups[dayLabel] = [];
    }

    groups[dayLabel].push(appointment);
  }

  return groups;
};

const formatDay = (isoString) => {
  const date = new Date(isoString);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return day + '.' + month + '.' + year + '.';
};

const formatTime = (isoString) => {
  const date = new Date(isoString);
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return hours + ':' + minutes;
};

const AppointmentSchedule = () => {
  const [vets, setVets] = useState([]);
  const [selectedVetId, setSelectedVetId] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    const loadVets = async () => {
      try {
        const vetsData = await getVets();
        setVets(vetsData);
      } catch (err) {
        setError('Greska pri ucitavanju liste veterinara.');
      }
    };

    loadVets();
  }, []);

  const loadAppointments = async (vetId) => {
    setLoading(true);
    setError('');
    try {
      const appointmentsData = await getUpcomingAppointments(vetId);
      setAppointments(appointmentsData);

      const patientsData = await getPatients({ vetId: vetId });
      setPatients(patientsData);
    } catch (err) {
      setError('Greska pri ucitavanju pregleda.');
    } finally {
      setLoading(false);
    }
  };

  const onVetChange = (event) => {
    const vetId = event.target.value;
    setSelectedVetId(vetId);
    setAppointments([]);
    setPatients([]);

    if (vetId) {
      loadAppointments(vetId);
    }
  };

  const onSchedule = async (data) => {
    setError('');

    try {
      await createAppointment({
        startTime: data.startTime,
        patientId: Number(data.patientId),
        vetId: selectedVetId
      });

      reset();
      loadAppointments(selectedVetId);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Greska pri zakazivanju pregleda.');
      }
    }
  };

  const groupedAppointments = groupByDay(appointments);
  const dayLabels = Object.keys(groupedAppointments);

  return (
    <div className="appointments-container">
      <h2>Zakazivanje pregleda</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>Veterinar:</label>
        <select value={selectedVetId} onChange={onVetChange}>
          <option value="">Izaberi veterinara</option>
          {vets.map((v) => (
            <option key={v.id} value={v.id}>{v.fullName}</option>
          ))}
        </select>
      </div>

      {selectedVetId && (
        <>
          <form onSubmit={handleSubmit(onSchedule)} className="schedule-form card">
            <h3>Novi pregled</h3>

            <div className="form-group">
              <label>Datum i vreme:</label>
              <input
                type="datetime-local"
                {...register('startTime', { required: 'Datum i vreme su obavezni' })}
              />
              {errors.startTime && <span className="error-message">{errors.startTime.message}</span>}
            </div>

            <div className="form-group">
              <label>Pacijent:</label>
              <select {...register('patientId', { required: 'Pacijent je obavezan' })}>
                <option value="">Izaberi pacijenta</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {errors.patientId && <span className="error-message">{errors.patientId.message}</span>}
            </div>

            <button type="submit" className="btn btn-primary">Zakazi pregled</button>
          </form>

          {loading ? (
            <p>Ucitavanje...</p>
          ) : dayLabels.length === 0 ? (
            <p>Nema predstojecih pregleda za odabranog veterinara.</p>
          ) : (
            dayLabels.map((dayLabel) => (
              <div key={dayLabel} className="appointments-day">
                <h3>{dayLabel}</h3>
                <table className="appointments-table">
                  <thead>
                    <tr>
                      <th>Vreme</th>
                      <th>Ljubimac</th>
                      <th>Vrsta</th>
                      <th>Godine</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedAppointments[dayLabel].map((a) => (
                      <tr key={a.id}>
                        <td>{formatTime(a.startTime)}</td>
                        <td>{a.patientName}</td>
                        <td>{a.animalSpeciesName}</td>
                        <td>{a.patientAge}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
};

export default AppointmentSchedule;