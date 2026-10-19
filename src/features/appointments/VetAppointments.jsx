import React, { useState, useEffect } from 'react';
import { getMyAppointments, cancelAppointment, submitReport, updateReport } from './services/appointmentService';
import '../../core/global.scss';
import './appointments.scss';

// Server nam uvek salje vreme u istom formatu, npr. "2026-09-16T10:30:00Z".
// Prvih 10 karaktera je uvek datum ("2026-09-16"), a karakteri od 11. do 16. su uvek vreme ("10:30").
// Zato ne moramo da koristimo Date objekat - prosto secemo tekst na tacno te pozicije.

const getDatePart = (startTime) => {
    const datePart = startTime.substring (0,10); // "2026-09-16"
    const pieces = datePart.split ('-'); // ["2026", "09", "16"]
    const year = pieces [0];
    const month = pieces [1];
    const day = pieces [2];
    return day + '.' + month + '.' + year + '.'; // "16.09.2026."
};

const getTimePart = (startTime) => {
    return startTime.substring (11,16); // "10:30"
};

const groupByDay = (appointments) => {
    const groups = {};

    for (let i=0; i<appointments.length; i++) {
        const appointment = appointments[i];
        const dayLabel = getDatePart(appointment.startTime);

        if (!groups[dayLabel]) {
            groups[dayLabel] = [];
        }

        groups[dayLabel].push(appointment);
    }
    return groups;
};

const VetAppointments = () => {
    const [appointments, setAppointments] = useState ([]);
    const [loading, setLoading] = useState (true);
    const [error, setError] = useState ('');
    const [cancellingId, setCancellingId] = useState (null);
    const [cancelReason, setCancelReason] = useState ('');
    const [reportingId, setReportingId] = useState (null);
    const [reportWeight, setReportWeight] = useState ('');
    const [reportAnamnesis, setReportAnamnesis] = useState ('');
    const [isEditingReport, setIsEditingReport] = useState (false);

    useEffect (() => {
        loadAppointments ();
    }, []);

    const loadAppointments = async () => {
        setLoading (true);
        setError ('');
        try {
            const data = await getMyAppointments ();
            setAppointments (data);
        } catch (err) {
            setError ('Greska pri ucitavanju pregleda.');
        } finally {
            setLoading(false);
        }
    };

    const onStartCancel = (id) => {
        setCancellingId (id);
        setCancelReason ('');
    };

    const onStopCancel = () => {
        setCancellingId (null);
        setCancelReason ('');
    };

    const onConfirmCancel = async (id) => {
        if (cancelReason.trim() === '') {
            setError ('Morate uneti razlog otkazivanja.');
            return;
        }
        try {
            await cancelAppointment (id, cancelReason);
            setCancellingId (null);
            setCancelReason ('');
            loadAppointments ();
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setError (err.response.data.error);
            } else {
                setError ('Greska pri otkazivanju pregleda.');
            }
        }
    };

    // Otvara formu za izvestaj. Ako izvestaj vec postoji (a.hasReport), unapred popunjava
    // postojece podatke - to je slucaj IZMENE. Ako ne postoji, forma je prazna - PODNOSENJE.
    // isEditingReport pamti tu odluku, da onConfirmReport zna sta da pozove kasnije.
    const onStartReport = (a) => {
        setReportingId (a.id);
        setIsEditingReport (a.hasReport);
        if (a.hasReport) {
            setReportWeight (a.weight);
            setReportAnamnesis (a.anamnesis);
        } else {
            setReportWeight ('');
            setReportAnamnesis ('');
        }
    };

    const onStopReport = () => {
        setReportingId (null);
        setReportWeight ('');
        setReportAnamnesis ('');
        setIsEditingReport (false);
    };

    const onConfirmReport = async (id) => {
        if (reportWeight.trim() === '' || reportAnamnesis.trim() === '') {
            setError ('Morate uneti kilazu i anamnezu.');
            return;
        }

        try {
            if (isEditingReport) {
                await updateReport (id, Number(reportWeight), reportAnamnesis);
            } else {
                await submitReport (id, Number(reportWeight), reportAnamnesis);
            }
            setReportingId (null);
            setReportWeight ('');
            setReportAnamnesis ('');
            setIsEditingReport (false);
            loadAppointments ();
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setError (err.response.data.error);
            } else {
                setError ('Greska pri cuvanju izvestaja.');
            }
        }
    };

    const groupedAppointments = groupByDay (appointments);
    const dayLabels = Object.keys (groupedAppointments);

    return (
        <div className = "appointments-container">
            <h2>Moji pregledi</h2>

            {error && <div className ="error-message">{error}</div>}

            {loading ? (
                <p>Ucitavanje...</p>
            ) : dayLabels.length === 0 ? (
                <p>Nemate zakazanih pregleda.</p>
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
                  <th>Status</th>
                  <th>Izvestaj</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {groupedAppointments[dayLabel].map((a) => (
                  <tr key={a.id} className={a.isCancelled ? 'appointment-cancelled' : ''}>
                    <td>{getTimePart(a.startTime)}</td>
                    <td>{a.patientName}</td>
                    <td>{a.animalSpeciesName}</td>
                    <td>{a.patientAge}</td>
                    <td>
                      {a.isCancelled ? `Otkazan (${a.cancellationReason})` : 'Zakazan'}
                    </td>
                    <td>
                      {a.isCancelled ? (
                        <span>-</span>
                      ) : reportingId === a.id ? (
                        <div className="report-form">
                          <input
                            type="number"
                            step="0.1"
                            placeholder="Kilaza (kg)"
                            value={reportWeight}
                            onChange={(event) => setReportWeight(event.target.value)}
                          />
                          <textarea
                            placeholder="Anamneza"
                            value={reportAnamnesis}
                            onChange={(event) => setReportAnamnesis(event.target.value)}
                          />
                          <div>
                            <button onClick={() => onConfirmReport(a.id)} className="btn btn-primary">Sacuvaj</button>
                            <button onClick={onStopReport} className="btn">Odustani</button>
                          </div>
                        </div>
                      ) : a.hasReport ? (
                        <div>
                          <p>{a.weight} kg - {a.anamnesis}</p>
                          {a.canEditReport && (
                            <button onClick={() => onStartReport(a)} className="btn btn-primary">Izmeni</button>
                          )}
                        </div>
                      ) : (
                        <button onClick={() => onStartReport(a)} className="btn btn-primary">Podnesi izvestaj</button>
                      )}
                    </td>
                    <td>
                      {!a.isCancelled && cancellingId === a.id && (
                        <div className="cancel-form">
                          <input
                            type="text"
                            placeholder="Razlog otkazivanja"
                            value={cancelReason}
                            onChange={(event) => setCancelReason(event.target.value)}
                          />
                          <button onClick={() => onConfirmCancel(a.id)} className="btn btn-danger">Potvrdi</button>
                          <button onClick={onStopCancel} className="btn">Odustani</button>
                        </div>
                      )}
                      {!a.isCancelled && cancellingId !== a.id && (
                        <button onClick={() => onStartCancel(a.id)} className="btn btn-danger">Otkazi</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default VetAppointments;