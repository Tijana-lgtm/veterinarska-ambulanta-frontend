import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import UserContext from '../../UserContext';
import { getPatientById, createPatient, updatePatient, getVets, getSpecies } from './services/patientService';
import '../../core/global.scss';
import './patients.scss';

const VET_ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const USERNAME_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';

const PatientForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [vets, setVets] = useState([]);
  const [species, setSpecies] = useState([]);
  const [ownerFullName, setOwnerFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    const loadData = async () => {
      try {
        const vetsData = await getVets();
        const speciesData = await getSpecies();
        setVets(vetsData);
        setSpecies(speciesData);

        if (isEditMode) {
          const patient = await getPatientById(id);
          setOwnerFullName(patient.ownerFullName);
          reset({
            name: patient.name,
            dateOfBirth: patient.dateOfBirth,
            animalSpeciesId: patient.animalSpeciesId,
            vetId: patient.vetId
          });
        } else {
          const username = user?.sub || user?.[USERNAME_CLAIM];
          const role = user?.role || user?.[VET_ROLE_CLAIM];

          if (role === 'Veterinar') {
            const self = vetsData.find((v) => v.userName === username);
            if (self) {
              reset({ vetId: self.id });
            }
          }
        }
      } catch (err) {
        setError('Greška pri učitavanju podataka.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmit = async (data) => {
    setError('');

    try {
      if (isEditMode) {
        await updatePatient(id, {
          name: data.name,
          dateOfBirth: data.dateOfBirth,
          animalSpeciesId: Number(data.animalSpeciesId),
          vetId: data.vetId
        });
      } else {
        await createPatient({
          name: data.name,
          dateOfBirth: data.dateOfBirth,
          animalSpeciesId: Number(data.animalSpeciesId),
          ownerUsername: data.ownerUsername,
          vetId: data.vetId
        });
      }

      navigate('/patients');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Greška na serveru. Proveri Network tab ili upotrebi debugger.');
      }
    }
  };

  if (loading) {
    return <p>Učitavanje...</p>;
  }

  return (
    <div className="patients-container">
      <form onSubmit={handleSubmit(onSubmit)} className="patient-form card">
        <h2>{isEditMode ? 'Izmena pacijenta' : 'Novi pacijent'}</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Ime ljubimca:</label>
          <input
            type="text"
            {...register('name', { required: 'Ime je obavezno' })}
          />
          {errors.name && <span className="error-message">{errors.name.message}</span>}
        </div>

        <div className="form-group">
          <label>Datum rođenja:</label>
          <input
            type="date"
            {...register('dateOfBirth', { required: 'Datum rođenja je obavezan' })}
          />
          {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth.message}</span>}
        </div>

        <div className="form-group">
          <label>Vrsta životinje:</label>
          <select {...register('animalSpeciesId', { required: 'Vrsta je obavezna' })}>
            <option value="">Izaberi vrstu</option>
            {species.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {errors.animalSpeciesId && <span className="error-message">{errors.animalSpeciesId.message}</span>}
        </div>

        {isEditMode ? (
          <div className="form-group">
            <label>Vlasnik:</label>
            <p className="readonly-field">{ownerFullName} (nije moguće menjati)</p>
          </div>
        ) : (
          <div className="form-group">
            <label>Korisničko ime vlasnika:</label>
            <input
              type="text"
              placeholder="npr. nikola.vlasnik"
              {...register('ownerUsername', { required: 'Korisničko ime vlasnika je obavezno' })}
            />
            {errors.ownerUsername && <span className="error-message">{errors.ownerUsername.message}</span>}
          </div>
        )}

        <div className="form-group">
          <label>Veterinar:</label>
          <select {...register('vetId', { required: 'Veterinar je obavezan' })}>
            <option value="">Izaberi veterinara</option>
            {vets.map((v) => (
              <option key={v.id} value={v.id}>{v.fullName}</option>
            ))}
          </select>
          {errors.vetId && <span className="error-message">{errors.vetId.message}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {isEditMode ? 'Sačuvaj izmene' : 'Kreiraj pacijenta'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;