//
import { openDB } from 'idb';
import CONFIG from '../config';

const DB_NAME = 'story-app-db';
const STORIES_STORE = 'stories';
const PENDING_STORE = 'pending-stories';
const TOKEN_STORE = 'auth-token'; // ✅ Tambahkan store baru

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORIES_STORE, { keyPath: 'id' });
    db.createObjectStore(PENDING_STORE, { autoIncrement: true, keyPath: 'id' });
    
    // ✅ Buat Object Store untuk Token
    db.createObjectStore(TOKEN_STORE, { keyPath: 'id' });
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
    // Kita tidak bisa menyimpan FormData, jadi simpan sebagai object
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

  // ✅ TAMBAHKAN DUA FUNGSI INI UNTUK TOKEN
  async putToken(token) {
    // Kita simpan token dengan id 'authToken'
    return (await dbPromise).put(TOKEN_STORE, { id: 'authToken', token });
  },

  async getToken() {
    const tokenObject = await (await dbPromise).get(TOKEN_STORE, 'authToken');
    return tokenObject ? tokenObject.token : null;
  },
};

export default IdbHelper;