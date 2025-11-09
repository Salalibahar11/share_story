//
import { openDB } from 'idb';
import CONFIG from '../config';

const DB_NAME = 'story-app-db';
const STORIES_STORE = 'stories';
const PENDING_STORE = 'pending-stories';
const TOKEN_STORE = 'auth-token';

// ✅ NAIKKAN NOMOR VERSI INI DARI 1 MENJADI 2
const dbPromise = openDB(DB_NAME, 2, {
  upgrade(db, oldVersion) {
    // Hapus store lama jika ada (untuk membersihkan)
    if (oldVersion < 1) {
      db.createObjectStore(STORIES_STORE, { keyPath: 'id' });
      db.createObjectStore(PENDING_STORE, { autoIncrement: true, keyPath: 'id' });
    }
    
    // ✅ Tambahkan store baru di versi 2
    if (oldVersion < 2) {
      db.createObjectStore(TOKEN_STORE, { keyPath: 'id' });
    }
  },
});

const IdbHelper = {
  // --- Kriteria 4 Basic: Simpan dan Baca data cerita ---
  async getAllStories() {
    return (await dbPromise).getAll(STORIES_STORE);
  },

  async putStory(story) {
    return (await dbPromise).put(STORIES_STORE, story);
  },

  async clearAllStories() {
    return (await dbPromise).clear(STORIES_STORE);
  },

  // --- Kriteria 4 Advanced: Simpan data pending sync ---
  async putPendingStory(storyData) {
    const storyObject = {
      photo: storyData.get('photo'),
      description: storyData.get('description'),
      lat: storyData.get('lat'),
      lon: storyData.get('lon'),
    };
    return (await dbPromise).put(PENDING_STORE, storyObject);
  },

  async getAllPendingStories() {
    return (await dbPromise).getAll(PENDING_STORE);
  },

  async deletePendingStory(id) {
    return (await dbPromise).delete(PENDING_STORE, id);
  },

  // --- Fungsi untuk Token ---
  async putToken(token) {
    return (await dbPromise).put(TOKEN_STORE, { id: 'authToken', token });
  },

  async getToken() {
    const tokenObject = await (await dbPromise).get(TOKEN_STORE, 'authToken');
    return tokenObject ? tokenObject.token : null;
  },
};

export default IdbHelper;