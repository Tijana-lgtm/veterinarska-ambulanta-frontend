import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  getPatients,
  getVets,
  getSpecies,
  deletePatient,
} from "./services/patientService";
import "../../core/global.scss";
import "./patients.scss";

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [vets, setVets] = useState([]);
  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const vetsData = await getVets();
        const speciesData = await getSpecies();
        setVets(vetsData);
        setSpecies(speciesData);
      } catch (err) {
        setError("Greska pri ucitavanju liste veterinara/vrsta.");
      }
    };

    loadLookups();
    loadPatients({});
  }, []);
  const loadPatients = async (filters) => {
    setLoading(true);
    setError("");
    try {
      const data = await getPatients(filters);
      setPatients(data);
    } catch (err) {
      setError("Greska pri ucitavanju pacijenata.");
    } finally {
      setLoading(false);
    }
  };

  const onSearch = (data) => {
    loadPatients({
      vetId: data.vetId,
      name: data.name,
      animalSpeciesId: data.animalSpeciesId,
      ageFrom: data.ageFrom,
      ageTo: data.ageTo,
    });
  };

  const onResetSearch = () => {
    reset();
    loadPatients({});
  };

  const onDelete = async (id) => {
    if (!window.confirm("Da li sigurno zelis da obrises ovog pacijenta?")) {
      return;
    }

    try {
      await deletePatient(id);
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError("Greska pri brisanju pacijenta.");
    }
  };

  return (
    <div className="patients-container">
      <div className="patients-header">
        <h2>Pacijenti</h2>
        <Link to="/patients/new" className="btn btn-primary">
          Novi pacijent
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit(onSearch)} className="search-form">
        <div className="search-row">
          <div className="form-group">
            <label>Ime ljubimca:</label>
            <input
              type="text"
              placeholder="Pretraga po imenu"
              {...register("name")}
            />
          </div>

          <div className="form-group">
            <label>Vrsta:</label>
            <select {...register("animalSpeciesId")}>
              <option value="">Sve vrste</option>
              {species.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Veterinar:</label>
            <select {...register("vetId")}>
              <option value="">Svi veterinari</option>
              {vets.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Starost od:</label>
            <input type="number" min="0" {...register("ageFrom")} />
          </div>

          <div className="form-group">
            <label>Starost do:</label>
            <input type="number" min="0" {...register("ageTo")} />
          </div>
        </div>

        <div className="search-actions">
          <button type="submit" className="btn btn-primary">
            Pretrazi
          </button>
          <button
            type="button"
            onClick={onResetSearch}
            className="btn btn-danger"
          >
            Resetuj
          </button>
        </div>
      </form>

      {loading ? (
        <p>Ucitavanje...</p>
      ) : (
        <table className="patients-table">
          <thead>
            <tr>
              <th>Ime</th>
              <th>Datum rodjenja</th>
              <th>Vrsta</th>
              <th>Vlasnik</th>
              <th>Veterinar</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 && (
              <tr>
                <td colSpan="6">Nema pacijenata koji odgovaraju pretrazi.</td>
              </tr>
            )}
            {patients.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.dateOfBirth}</td>
                <td>{p.animalSpeciesName}</td>
                <td>{p.ownerFullName}</td>
                <td>{p.vetFullName}</td>
                <td className="patients-actions">
                  <Link
                    to={`/patients/${p.id}/edit`}
                    className="btn btn-primary"
                  >
                    Izmeni
                  </Link>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="btn btn-danger"
                  >
                    Obrisi
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PatientList;
