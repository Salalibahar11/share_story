import L from 'leaflet';
import { addNewStory } from '../../data/api';
import IdbHelper from '../../data/idb-helper';

export default class AddStoryPage {
  async render() {
    return `
      <div class="form-wrapper">
        <form id="addStoryForm" class="add-story-form" novalidate>
          <h1>Tambah Cerita Baru</h1>
          <div class="form-group">
            <label for="photo">Gambar</label>
            <input type="file" id="photo" name="photo" accept="image/*" required>
            <span id="photoError" class="error-message"></span>
          </div>
          <div class="form-group">
            <label for="description">Deskripsi</label>
            <textarea id="description" name="description" rows="4" required></textarea>
            <span id="descriptionError" class="error-message"></span>
          </div>
            <div class="form-group">
            <label for="add-map">Lokasi (klik pada peta)</label>
            <div id="add-map"></div> <input type="hidden" id="lat" name="lat">
            <input type="hidden" id="lon" name="lon" required>
            <span id="locationError" class="error-message"></span>
          </div>
          <button type="submit">Unggah Cerita</button>
          <p id="form-status" style="text-align: center;"></p>
        </form>
      </div>
    `;
  }

  async afterRender() {
    this._initMap();
    this._initFormValidation();
  }

  _initMap() {

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'images/marker-icon.png',
      iconRetinaUrl: 'images/marker-icon-2x.png',
      shadowUrl: 'images/marker-shadow.png',
    });

    const map = L.map('add-map').setView([-2.5489, 118.0149], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    let marker;
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      document.getElementById('lat').value = lat;
      document.getElementById('lon').value = lng;

      if (marker) {
        marker.setLatLng(e.latlng);
      } else {
        marker = L.marker(e.latlng).addTo(map);
      }
      document.getElementById('locationError').textContent = '';
    });
  }
  
  _initFormValidation() {
    const form = document.getElementById('addStoryForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      let isValid = true;
      const description = document.getElementById('description');
      const lat = document.getElementById('lat');
      const photo = document.getElementById('photo');
      const statusElement = document.getElementById('form-status');

      if (!photo.files[0]) {
        document.getElementById('photoError').textContent = 'Gambar tidak boleh kosong.';
        isValid = false;
      } else {
        document.getElementById('photoError').textContent = '';
      }

      if (!description.value) {
        document.getElementById('descriptionError').textContent = 'Deskripsi tidak boleh kosong.';
        isValid = false;
      } else {
        document.getElementById('descriptionError').textContent = '';
      }

      if (!lat.value) {
        document.getElementById('locationError').textContent = 'Silakan pilih lokasi di peta.';
        isValid = false;
      } else {
        document.getElementById('locationError').textContent = '';
      }

      if (!isValid) return;

      const formData = new FormData();
      formData.append('photo', photo.files[0]);
      formData.append('description', description.value);
      formData.append('lat', lat.value);
      formData.append('lon', document.getElementById('lon').value);

      statusElement.textContent = 'Mengunggah...';
      try {
        await addNewStory(formData);
        statusElement.textContent = 'Cerita berhasil ditambahkan!';
        statusElement.style.color = 'var(--success-color)';
        setTimeout(() => {
          window.location.hash = '#/';
        }, 1500);
      } catch (error) {

        statusElement.textContent = `Gagal mengunggah: ${error.message}`;
        statusElement.style.color = 'var(--error-color)';
        

        if (navigator.onLine === false || error.message.includes('Failed to fetch')) {
          try {
            await IdbHelper.putPendingStory(formData);
            statusElement.textContent = 'Gagal mengunggah. Cerita disimpan dan akan di-sync saat online.';
            statusElement.style.color = 'var(--secondary-color)';


            if ('serviceWorker' in navigator && 'SyncManager' in window) {
              navigator.serviceWorker.ready.then(registration => {
                registration.sync.register('sync-pending-stories');
              });
            }
          } catch (idbError) {
            console.error('Gagal menyimpan ke IDB:', idbError);
            statusElement.textContent = 'Gagal mengunggah dan gagal menyimpan offline.';
          }
        }
      }
    });
  }
}