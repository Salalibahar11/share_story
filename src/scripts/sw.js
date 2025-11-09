/* eslint-disable no-restricted-globals */
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import CONFIG from './config';
import IdbHelper from './data/idb-helper'; // ✅ Import IdbHelper

// ❌ HAPUS IMPORT INI (penyebab error):
// import { addNewStory } from './data/api'; 

// Inject manifest dari Workbox
precacheAndRoute(self.__WB_MANIFEST || []);

// Kriteria 3 (Advanced): Cache data API (StaleWhileRevalidate)
registerRoute(
  ({ url }) => url.href.startsWith(CONFIG.BASE_URL),
  new StaleWhileRevalidate({
    cacheName: 'story-api-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  }),
);

// Kriteria 3 (Basic): Cache App Shell (CacheFirst)
registerRoute(
  ({ request }) => request.destination === 'style'
    || request.destination === 'script'
    || request.destination === 'image'
    || request.destination === 'font',
  new CacheFirst({
    cacheName: 'app-shell-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  }),
);

// Kriteria 2: Push Notification Event Handler
self.addEventListener('push', (event) => {
  console.log('Push Notification received:', event);
  const notificationData = event.data.json();
  const { title, body, icon, data } = notificationData;
  const options = {
    body,
    icon: icon || 'favicon.png',
    badge: 'favicon.png',
    data,
    actions: [
      { action: 'explore-action', title: 'Lihat Cerita' },
    ],
  };
  event.waitUntil(
    self.registration.showNotification(title, options),
  );
});

// Kriteria 2 (Advanced): Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const storyId = event.notification.data.storyId;
  if (event.action === 'explore-action' && storyId) {
    event.waitUntil(clients.openWindow(`/#/`));
  } else {
    event.waitUntil(clients.openWindow('/'));
  }
});

// Kriteria 4 (Advanced): Background Sync Handler
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-stories') {
    console.log('Menjalankan background sync untuk "sync-pending-stories"');
    event.waitUntil(syncPendingStories());
  }
});

// ✅ FUNGSI SYNC YANG SUDAH DIPERBAIKI
async function syncPendingStories() {
  const pendingStories = await IdbHelper.getAllPendingStories();
  
  // Ambil token dari IndexedDB
  const token = await IdbHelper.getToken();
  if (!token) {
    console.error('Sync gagal: Token tidak ditemukan di IDB.');
    return; // Hentikan jika tidak ada token
  }

  for (const story of pendingStories) {
    const formData = new FormData();
    formData.append('photo', story.photo);
    formData.append('description', story.description);
    formData.append('lat', story.lat);
    formData.append('lon', story.lon);

    try {
      // Lakukan fetch manual menggunakan token dari IDB
      const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      
      const responseJson = await response.json();
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      console.log('Sync berhasil:', responseJson);
      // Jika berhasil, hapus dari IDB
      await IdbHelper.deletePendingStory(story.id);

      // Tampilkan notifikasi sukses
      self.registration.showNotification('Sync Berhasil', {
        body: `Cerita "${story.description.substring(0, 20)}..." berhasil diunggah!`,
        icon: 'favicon.png',
      });
    } catch (error) {
      console.error('Sync gagal untuk cerita:', story, error);
      // Jika gagal lagi, data akan tetap di IDB dan dicoba lagi di sync berikutnya
    }
  }
}