import api from './api';

export const getEvents = (params) => api.get('/events', { params }).then((r) => r.data);
export const getMyEvents = () => api.get('/events/mine').then((r) => r.data);
export const getEvent = (id) => api.get(`/events/${id}`).then((r) => r.data);
// create/update send FormData because of the poster file
export const createEvent = (formData) => api.post('/events', formData).then((r) => r.data);
export const updateEvent = (id, formData) => api.put(`/events/${id}`, formData).then((r) => r.data);
export const deleteEvent = (id) => api.delete(`/events/${id}`).then((r) => r.data);
export const registerForEvent = (id) => api.post(`/events/${id}/register`).then((r) => r.data);
export const cancelRegistration = (id) => api.delete(`/events/${id}/register`).then((r) => r.data);
export const getParticipants = (id) => api.get(`/events/${id}/participants`).then((r) => r.data);
// Student bookmarks ("Saved events")
export const getSavedEvents = () => api.get('/events/saved').then((r) => r.data);
export const saveEvent = (id) => api.post(`/events/${id}/save`).then((r) => r.data);
export const unsaveEvent = (id) => api.delete(`/events/${id}/save`).then((r) => r.data);
