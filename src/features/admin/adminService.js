import { api } from './adminClient';

// --- Dashboard & stats -------------------------------------------------
export const fetchDashboard = () => api('/dashboard');
export const fetchStats = (days = 90) => api(`/stats?days=${days}`);

// --- Leads -----------------------------------------------------------
export function fetchLeads({ type = 'all', status = 'all', q = '' } = {}) {
  const params = new URLSearchParams({ type, status });
  if (q) params.set('q', q);
  return api(`/leads?${params.toString()}`);
}
export const fetchLead = (id) => api(`/leads/${id}`);
export const setLeadStatus = (id, status, lostReason) =>
  api(`/leads/${id}/status`, { method: 'POST', body: { status, lostReason } });

// --- Case studies --------------------------------------------------
export const listCaseStudies = () => api('/case-studies').then((r) => r.items);
export const getCaseStudy = (id) => api(`/case-studies/${id}`).then((r) => r.item);
export const createCaseStudy = (payload) => api('/case-studies', { method: 'POST', body: payload }).then((r) => r.item);
export const updateCaseStudy = (id, payload) =>
  api(`/case-studies/${id}`, { method: 'PATCH', body: payload }).then((r) => r.item);
export const deleteCaseStudy = (id) => api(`/case-studies/${id}`, { method: 'DELETE' });

// --- Blog ---------------------------------------------------------
export const listBlogPosts = () => api('/blog-posts').then((r) => r.items);
export const getBlogPost = (id) => api(`/blog-posts/${id}`).then((r) => r.item);
export const createBlogPost = (payload) => api('/blog-posts', { method: 'POST', body: payload }).then((r) => r.item);
export const updateBlogPost = (id, payload) =>
  api(`/blog-posts/${id}`, { method: 'PATCH', body: payload }).then((r) => r.item);
export const deleteBlogPost = (id) => api(`/blog-posts/${id}`, { method: 'DELETE' });

export const listCategories = () => api('/blog-categories').then((r) => r.items);
export const createCategory = (payload) => api('/blog-categories', { method: 'POST', body: payload }).then((r) => r.item);
export const updateCategory = (id, payload) =>
  api(`/blog-categories/${id}`, { method: 'PATCH', body: payload }).then((r) => r.item);
export const deleteCategory = (id) => api(`/blog-categories/${id}`, { method: 'DELETE' });

// --- Uploads -----------------------------------------------------
export async function uploadImage(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await api('/uploads', { method: 'POST', form });
  return res.url;
}
