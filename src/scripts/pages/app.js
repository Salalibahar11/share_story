// src/scripts/pages/app.js
import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import NOTIFICATION_HELPER from '../utils/notification-helper';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._updateLoginStatus(); // ✅ Panggil fungsi baru di sini
  }

  // ✅ FUNGSI BARU UNTUK MENGATUR LOGIN/LOGOUT
  _updateLoginStatus() {
    const loginLogoutLink = document.getElementById('login-logout-link');
    const token = sessionStorage.getItem('authToken');

    if (token) {
      // Jika pengguna sudah login
      loginLogoutLink.textContent = 'Logout';
      loginLogoutLink.href = '#/'; // Arahkan ke beranda saat logout
      loginLogoutLink.addEventListener('click', (event) => {
        event.preventDefault();
        sessionStorage.removeItem('authToken'); // Hapus token
        alert('Anda telah logout.');
        window.location.reload(); // Muat ulang halaman
      }, { once: true }); // Listener hanya berjalan sekali
    } else {
      // Jika pengguna belum login
      loginLogoutLink.textContent = 'Login';
      loginLogoutLink.href = '#/login';
    }
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const token = sessionStorage.getItem('authToken');
    
    // Tentukan rute publik (tidak perlu login)
    const publicRoutes = ['/login', '/register'];
    const isPublicRoute = publicRoutes.includes(url);

    // Route Guard:
    // 1. Jika BELUM login (token=null) DAN mencoba akses rute non-publik
    if (!token && !isPublicRoute) {
      console.log('Token not found, redirecting to login.');
      window.location.hash = '#/login';
      // Kita perlu me-render halaman login secara manual di sini
      // agar tidak terjadi loop/halaman kosong
      const loginPage = routes['/login'];
      this.#content.innerHTML = await loginPage.render();
      await loginPage.afterRender();
      this.#content.focus();
      return; // Hentikan renderPage
    }

    // 2. Jika SUDAH login (token=ada) DAN mencoba akses rute publik (login/register)
    if (token && isPublicRoute) {
      console.log('Token found, redirecting to home.');
      window.location.hash = '#/';
      // Hentikan renderPage, hashchange akan memicu renderPage() lagi
      return; 
    }

    // Jika lolos guard, render halaman seperti biasa
    const page = routes[url];
    if (!page) {
      // Handle 404 jika halaman tidak ada di routes
      console.log(`Page not found for route: ${url}`);
      window.location.hash = '#/'; // Arahkan ke beranda
      return;
    }

    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
        this.#content.focus();
      });
    } else {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      this.#content.focus();
    }
  }
}

export default App;