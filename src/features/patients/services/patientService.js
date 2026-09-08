import axiosConfig from "../../../core/axiosConfig";

export const getPatients = async (filter = {}) => {
  const params = Object.fromEntries(
    Object.entries(filter).filter(
      ([, value]) => value !== null && value !== undefined && value !== "",
    ),
  );

  const response = await axiosConfig.get("/patients", { params });
  return response.data;
};

export const getPatientById = async (id) => {
  const response = await axiosConfig.get(`/patients/${id}`);
  return response.data;
};

export const createPatient = async (patientData) => {
  const response = await axiosConfig.post("/patients", patientData);
  return response.data;
};

export const updatePatient = async (id, patientData) => {
  const response = await axiosConfig.put(`/patients/${id}`, patientData);
  return response.data;
};

export const deletePatient = async (id) => {
  await axiosConfig.delete(`/patients/${id}`);
};

export const getVets = async () => {
  const response = await axiosConfig.get("/patients/vets");
  return response.data;
};

export const getSpecies = async () => {
  const response = await axiosConfig.get("/patients/species");
  return response.data;
};
