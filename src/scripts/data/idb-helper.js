//
import { openDB } from 'idb';
import CONFIG from '../config';

const DB_NAME = 'story-app-db';
const STORIES_STORE = 'stories';
const PENDING_STORE = 'pending-stories';
const TOKEN_STORE = 'auth-token';

const dbPromise = openDB(DB_NAME, 2, {
  upgrade(db, oldVersion) {

    if (oldVersion < 1) {
      db.createObjectStore(STORIES_STORE, { keyPath: 'id' });
      db.createObjectStore(PENDING_STORE, { autoIncrement: true, keyPath: 'id' });
    }
    
    if (oldVersion < 2) {
      db.createObjectStore(TOKEN_STORE, { keyPath: 'id' });
    }
  },
});

const IdbHelper = {

  async getAllStories() {
    return (await dbPromise).getAll(STORIES_STORE);
  },

  async putStory(story) {
    return (await dbPromise).put(STORIES_STORE, story);
  },

  async clearAllStories() {
    return (await dbPromise).clear(STORIES_STORE);
  },

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

  async putToken(token) {
    return (await dbPromise).put(TOKEN_STORE, { id: 'authToken', token });
  },

  async getToken() {
    const tokenObject = await (await dbPromise).get(TOKEN_STORE, 'authToken');
    return tokenObject ? tokenObject.token : null;
  },
};

export default IdbHelper;