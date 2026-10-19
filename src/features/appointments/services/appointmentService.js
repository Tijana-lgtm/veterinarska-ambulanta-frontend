import axiosConfig from "../../../core/axiosConfig";

export const getUpcomingAppointments = async (vetId) => {
    const response = await axiosConfig.get('/appointments', {params: {vetId} });
    return response.data;
};

export const createAppointment = async (appointmentData) => {
    const response = await axiosConfig.post ('/appointments', appointmentData);
    return response.data;
};

export const getMyAppointments = async () => {
    const response = await axiosConfig.get('/appointments/my');
    return response.data;
};

export const cancelAppointment = async (id, reason) => {
    const response = await axiosConfig.put(`/appointments/${id}/cancel`, {reason: reason});
    return response.data;
};

export const submitReport = async (id, weight, anamnesis) => {
    const response = await axiosConfig.post(`/appointments/${id}/report`, {weight: weight, anamnesis: anamnesis});
    return response.data;
}

export const updateReport = async (id, weight, anamnesis) => {
    const response = await axiosConfig.post(`/appointments/${id}/report`, {weight: weight, anamnesis: anamnesis});
    return response.data;
}