
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const NOTIFICATION_HELPER = {
  async requestPermission() {
    if (!('Notification' in window)) {
      alert('Browser tidak mendukung notifikasi.');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      this._subscribeToPush();
    } else {
      console.log('Notification permission denied.');
    }
  },

  async _subscribeToPush() {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {

        const vapidPublicKey = 'BG-vidmvs8FJWZ7b_Koj231oYylha4sT9v9UXRl3AtQTXQ2CJCAcetZAQRiKrfPjBP6B8ZIZlr75on6TEOfG7T8';
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      console.log('Push Subscription:', subscription.toJSON());

      alert('Berhasil subscribe push notification!');
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      alert('Gagal subscribe push notification.');
    }
  },
};

export default NOTIFICATION_HELPER;