import L from 'leaflet';
import { getAllStories } from '../../data/api';
import IdbHelper from '../../data/idb-helper';
import NOTIFICATION_HELPER from '../../utils/notification-helper';

export default class HomePage {
  async render() {
    return `
      <div class="main-card">
        <div id="map"></div>
        <div id="story-list-container">

          <div style="padding-bottom: 20px; text-align: right;">
            <button id="notification-toggle" class="button-secondary">
              Aktifkan Notifikasi
            </button>
          </div>

          <h1>Daftar Cerita</h1>
          <div class="table-wrapper">
          
            <table class="story-table">
              <thead>
                <tr>
                  <th>Gambar</th>
                  <th>Pengirim</th>
                  <th>Deskripsi</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody id="story-table-body">
                </tbody>
            </table>
            
          </div>
          <p id="story-list-placeholder">Memuat cerita...</p>
        </div>
      </div>
    `;
  }
  
  async afterRender() {

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'images/marker-icon.png',
      iconRetinaUrl: 'images/marker-icon-2x.png',
      shadowUrl: 'images/marker-shadow.png',
    });

    this.map = L.map('map').setView([-2.5489, 118.0149], 5);

    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri',
    });

    const baseLayers = { 'Street Map': osmLayer, 'Satellite': satelliteLayer };
    L.control.layers(baseLayers).addTo(this.map);

    setTimeout(() => this.map.invalidateSize(true), 400);

    this._loadAndDisplayStories();
    this._initNotificationButton();
  }

  _initNotificationButton() {
    const notificationButton = document.getElementById('notification-toggle');
    if (notificationButton) {
      notificationButton.addEventListener('click', (event) => {
        event.stopPropagation();
        NOTIFICATION_HELPER.requestPermission();
      });
    }
  }

  async _loadAndDisplayStories() {

    const tableBody = document.getElementById('story-table-body');
    const placeholder = document.getElementById('story-list-placeholder');

    if (!tableBody || !placeholder) {
      console.error('Elemen tableBody atau placeholder tidak ditemukan!');
      return;
    }

    placeholder.innerHTML = 'Memuat cerita...';

    let stories = [];
    try {
      console.log('Fetching stories from API...');
      stories = await getAllStories();
      
      await IdbHelper.clearAllStories();
      stories.forEach(story => IdbHelper.putStory(story));
      
      console.log('Stories fetched from API and saved to IDB.');
    } catch (error) {

      console.error(`Gagal memuat dari API: ${error.message}. Mengambil dari IDB...`);
      placeholder.innerHTML = `Gagal memuat dari API. Menampilkan data offline...`;
      stories = await IdbHelper.getAllStories();
      
      if (stories.length === 0) {
        placeholder.innerHTML = 'Tidak ada data offline. Harap hubungkan ke internet.';
      }
    }

    this._renderStoriesToTable(stories, tableBody, placeholder);
  }


  _renderStoriesToTable(stories, tableBody, placeholder) {
    tableBody.innerHTML = '';
    if (stories.length === 0) {
      placeholder.innerHTML = 'Belum ada cerita yang ditambahkan.';
      placeholder.style.display = 'block';
      return;
    }

    placeholder.style.display = 'none';

    stories.forEach(story => {
      const row = tableBody.insertRow();
      row.className = 'story-row';
      row.innerHTML = `
        <td><img src="${story.photoUrl}" alt="Gambar untuk ${story.name}" class="story-thumbnail" crossorigin="anonymous"></td>
        <td><strong>${story.name}</strong></td>
        <td>${story.description}</td>
        <td>${new Date(story.createdAt).toLocaleDateString()}</td>
      `;

      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(this.map)
          .bindPopup(`<b>${story.name}</b><br>${story.description}`);
        
        row.addEventListener('click', () => {
          this.map.flyTo([story.lat, story.lon], 15);
          marker.openPopup();
        });
      }

      const favoriteButton = row.querySelector('.btn-favorite');
      favoriteButton.addEventListener('click', async (e) => {
        e.stopPropagation(); // Hentikan klik peta
        e.target.innerText = 'Disimpan';
        e.target.disabled = true;
        await IdbHelper.addFavorite(story);
        alert('Cerita disimpan ke Favorit!');
      });
    });
    };
  }
