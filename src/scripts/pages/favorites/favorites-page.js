// src/scripts/pages/favorites/favorites-page.js
import IdbHelper from '../../data/idb-helper';

export default class FavoritesPage {
  async render() {
    return `
      <div class="main-card">
        <div id="story-list-container">
          <h1>Cerita Favorit (Offline)</h1>
          <div class="table-wrapper">
            <table class="story-table">
              <thead>
                <tr>
                  <th>Gambar</th>
                  <th>Pengirim</th>
                  <th>Deskripsi</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody id="favorite-stories-body">
                </tbody>
            </table>
          </div>
          <p id="favorite-placeholder">Memuat favorit...</p>
        </div>
      </div>
    `;
  }

  async afterRender() {
    await this._loadAndDisplayFavorites();
  }

  async _loadAndDisplayFavorites() {
    const tableBody = document.getElementById('favorite-stories-body');
    const placeholder = document.getElementById('favorite-placeholder');
    
    const stories = await IdbHelper.getAllFavorites();
    
    if (stories.length === 0) {
      placeholder.innerHTML = 'Belum ada cerita favorit yang disimpan.';
      return;
    }
    
    placeholder.style.display = 'none';
    tableBody.innerHTML = '';

    stories.forEach(story => {
      const row = tableBody.insertRow();
      row.innerHTML = `
        <td><img src="${story.photoUrl}" alt="${story.name}" class="story-thumbnail" crossorigin="anonymous"></td>
        <td><strong>${story.name}</strong></td>
        <td>${story.description}</td>
        <td><button class="button-secondary btn-delete" data-id="${story.id}">Hapus</button></td>
      `;

      // Tambahkan listener untuk Hapus (Delete)
      row.querySelector('.btn-delete').addEventListener('click', async (e) => {
        const storyId = e.target.dataset.id;
        await IdbHelper.deleteFavorite(storyId);
        alert('Favorit dihapus.');
        await this._loadAndDisplayFavorites(); // Render ulang
      });
    });
  }
}