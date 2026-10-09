import api from './api';

export const getClubs = () => api.get('/clubs').then((r) => r.data);
export const createClub = (data) => api.post('/clubs', data).then((r) => r.data);
export const updateClub = (id, data) => api.put(`/clubs/${id}`, data).then((r) => r.data);
export const deleteClub = (id) => api.delete(`/clubs/${id}`).then((r) => r.data);
