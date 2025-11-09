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
    this._updateLoginStatus(); 
  }

  _updateLoginStatus() {
    const loginLogoutLink = document.getElementById('login-logout-link');
    const token = sessionStorage.getItem('authToken');

    if (token) {

      loginLogoutLink.textContent = 'Logout';
      loginLogoutLink.href = '#/'; 
      loginLogoutLink.addEventListener('click', (event) => {
        event.preventDefault();
        sessionStorage.removeItem('authToken'); 
        alert('Anda telah logout.');
        window.location.reload(); 
      }, { once: true }); 
    } else {

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
    

    const publicRoutes = ['/login', '/register'];
    const isPublicRoute = publicRoutes.includes(url);

    if (!token && !isPublicRoute) {
      console.log('Token not found, redirecting to login.');
      window.location.hash = '#/login';

      const loginPage = routes['/login'];
      this.#content.innerHTML = await loginPage.render();
      await loginPage.afterRender();
      this.#content.focus();
      return; 
    }

    if (token && isPublicRoute) {
      console.log('Token found, redirecting to home.');
      window.location.hash = '#/';

      return; 
    }


    const page = routes[url];
    if (!page) {

      console.log(`Page not found for route: ${url}`);
      window.location.hash = '#/'; 
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