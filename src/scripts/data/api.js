import CONFIG from '../config';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
};

const getAuthToken = () => {
  return sessionStorage.getItem('authToken');
};

// register
export async function register(credentials) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  const responseJson = await response.json();
  if (responseJson.error) {
    throw new Error(responseJson.message);
  }
  return responseJson;
}

// login
export async function login(credentials) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  const responseJson = await response.json();
  if (responseJson.error) {
    throw new Error(responseJson.message);
  }
  return responseJson;
}

// export
export async function getAllStories() {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Token tidak ditemukan. Silakan periksa kembali.');
  }

  const response = await fetch(ENDPOINTS.STORIES, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const responseJson = await response.json();
  if (responseJson.error) {
    throw new Error(responseJson.message);
  }
  return responseJson.listStory;
}

export async function addNewStory(formData) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Missing authentication. Silakan login terlebih dahulu.');
  }

  const response = await fetch(ENDPOINTS.ADD_STORY, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  const responseJson = await response.json();
  if (responseJson.error) {
    throw new Error(responseJson.message);
  }
  return responseJson;
}