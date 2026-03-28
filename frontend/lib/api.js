const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseUrl = API_URL;
  }

  getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  setToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      ...(options.rawBody ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
      body: options.rawBody ? options.body : options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // Auth
  async register(email, password, full_name) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: { email, password, full_name },
    });
    if (data.session?.access_token) {
      this.setToken(data.session.access_token);
    }
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (data.access_token) {
      this.setToken(data.access_token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    }
    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Scores
  async getScores() {
    return this.request('/scores');
  }

  async addScore(score, course_name, played_at) {
    return this.request('/scores', {
      method: 'POST',
      body: { score, course_name, played_at },
    });
  }

  async updateScore(id, data) {
    return this.request(`/scores/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteScore(id) {
    return this.request(`/scores/${id}`, { method: 'DELETE' });
  }

  // Subscription
  async subscribe() {
    return this.request('/subscribe', { method: 'POST', body: {} });
  }

  async getSubscriptionStatus() {
    return this.request('/subscribe/status');
  }

  async getPortalUrl() {
    return this.request('/subscribe/portal', { method: 'POST' });
  }

  // Draws
  async getDrawResults(month) {
    const query = month ? `?month=${month}` : '';
    return this.request(`/draw-results${query}`);
  }

  async getLatestDraw() {
    return this.request('/draw-results/latest');
  }

  // Charities
  async getCharities() {
    return this.request('/charities');
  }

  async selectCharity(charity_id) {
    return this.request('/charities/select', {
      method: 'POST',
      body: { charity_id },
    });
  }

  async getMyContributions() {
    return this.request('/charities/contributions');
  }

  // Winners
  async submitProof(draw_result_id, proof_url) {
    return this.request('/winners/proof', {
      method: 'POST',
      body: { draw_result_id, proof_url },
    });
  }

  async getMyWins() {
    return this.request('/winners/my-wins');
  }

  // Admin
  async getUsers(page = 1, limit = 20, search = '') {
    return this.request(`/admin/users?page=${page}&limit=${limit}&search=${search}`);
  }

  async getReports() {
    return this.request('/admin/reports');
  }

  async runDraw(month, mode) {
    return this.request('/admin/run-draw', {
      method: 'POST',
      body: { month, mode },
    });
  }

  async getAdminDraws() {
    return this.request('/admin/draws');
  }

  async verifyWinner(winner_id, status, notes) {
    return this.request('/admin/verify-winner', {
      method: 'POST',
      body: { winner_id, status, notes },
    });
  }

  async getPendingWinners() {
    return this.request('/admin/winners');
  }

  async createCharity(data) {
    return this.request('/admin/charities/create', {
      method: 'POST',
      body: data,
    });
  }

  async updateCharity(data) {
    return this.request('/admin/charities/update', {
      method: 'POST',
      body: data,
    });
  }

  async deleteCharity(id) {
    return this.request('/admin/charities/delete', {
      method: 'POST',
      body: { id },
    });
  }
}

export const api = new ApiClient();
export default api;
