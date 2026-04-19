class AuthService {
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  logout(): void {
    localStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }
}

export default new AuthService();
