import { register } from '../../data/api';

export default class RegisterPage {
  async render() {
    return `
      <div class="form-wrapper">
        <form id="registerForm" class="add-story-form">
          <h1>Register Akun Baru</h1>
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>
          </div>
          <button type="submit">Register</button>
          <p id="register-status" style="text-align: center;"></p>
        </form>
        <p class="auth-link">Sudah punya akun? <a href="#/login">Login di sini</a>.</p>
      </div>
    `;
  }
  
  async afterRender() {
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const statusElement = document.getElementById('register-status');
      statusElement.textContent = 'Registering...';

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        await register({ name, email, password });
        statusElement.textContent = 'Registrasi berhasil! Silakan login.';
        statusElement.style.color = 'var(--success-color)';
        
        setTimeout(() => {
          window.location.hash = '#/login';
        }, 1500);
      } catch (error) {
        statusElement.textContent = `Registrasi gagal: ${error.message}`;
        statusElement.style.color = 'var(--error-color)';
      }
    });
  }
}