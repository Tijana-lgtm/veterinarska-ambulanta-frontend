import axiosConfig from "../../../core/axiosConfig";

export const getUpcomingAppointments = async (vetId) => {
    const response = await axiosConfig.get('/appointments', {params: {vetId} });
    return response.data;
};

export const createAppointment = async (appointmentData) => {
    const response = await axiosConfig.post ('/appointments', appointmentData);
    return response.data;
}