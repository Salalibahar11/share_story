import { login } from '../../data/api';
import IdbHelper from '../../data/idb-helper';

export default class LoginPage {
  async render() {
    return `
      <div class="form-wrapper">
        <form id="loginForm" class="login-form">
          <h1>Login</h1>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" required>
          </div>
          <button type="submit">Login</button>
          <p id="login-status" style="text-align: center;"></p>
        </form>
        <p class="auth-link">Belum punya akun? <a href="#/register">Daftar di sini</a>.</p>
      </div>
    `;
  }

  async afterRender() {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const statusElement = document.getElementById('login-status');
      statusElement.textContent = 'Logging in...';

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const response = await login({ email, password });
        
        localStorage.setItem('authToken', response.loginResult.token);
        await IdbHelper.putToken(response.loginResult.token); 

        alert('Login berhasil!');
        
        window.location.hash = '#/';
        
      } catch (error) {
        statusElement.textContent = `Login gagal: ${error.message}`;
        statusElement.style.color = 'var(--error-color)';
      }
    });
  }
}