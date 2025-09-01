const CACHE_NAME = 'speedy-van-v1';
const OFFLINE_URL = '/offline';

// Files to cache for offline use
const urlsToCache = ['/', '/offline'];

// Install event - cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API requests (they should always go to network)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      // Return cached version or fetch from network
      return (
        response ||
        fetch(event.request)
          .then(response => {
            // Cache successful responses for pages
            if (response.status === 200 && response.type === 'basic') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            }
            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.destination === 'document') {
              return caches.match(OFFLINE_URL);
            }
          })
      );
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('Background sync triggered:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  } else if (event.tag === 'driver-status-sync') {
    event.waitUntil(doDriverStatusSync());
  } else if (event.tag === 'job-status-sync') {
    event.waitUntil(doJobStatusSync());
  }
});

// Push notification handling
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New job offer available!',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'View Offer',
        icon: '/icon-192x192.png',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.png',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification('Speedy Van Driver', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/'));
  }
});

// Background sync function
async function doBackgroundSync() {
  try {
    console.log('Starting background sync...');
    // Get pending actions from IndexedDB
    const pendingActions = await getPendingActions();

    for (const action of pendingActions) {
      try {
        console.log('Processing action:', action.id, action.type);
        // Retry the action
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        });

        if (response.ok) {
          console.log('Action successful:', action.id);
          // Remove from pending actions
          await removePendingAction(action.id);
        } else {
          console.warn('Action failed:', action.id, response.status);
        }
      } catch (error) {
        console.error('Background sync failed for action:', action.id, error);
      }
    }
    console.log('Background sync completed');
  } catch (error) {
    console.error('Background sync error:', error);
  }
}

// Driver status sync function
async function doDriverStatusSync() {
  try {
    console.log('Starting driver status sync...');
    const pendingActions = await getPendingActions();
    const driverActions = pendingActions.filter(
      action =>
        action.type === 'location_update' ||
        action.type === 'availability_update'
    );

    for (const action of driverActions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        });

        if (response.ok) {
          await removePendingAction(action.id);
        }
      } catch (error) {
        console.error(
          'Driver status sync failed for action:',
          action.id,
          error
        );
      }
    }
  } catch (error) {
    console.error('Driver status sync error:', error);
  }
}

// Job status sync function
async function doJobStatusSync() {
  try {
    console.log('Starting job status sync...');
    const pendingActions = await getPendingActions();
    const jobActions = pendingActions.filter(
      action =>
        action.type === 'job_progress' ||
        action.type === 'job_claim' ||
        action.type === 'job_decline'
    );

    for (const action of jobActions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        });

        if (response.ok) {
          await removePendingAction(action.id);
        }
      } catch (error) {
        console.error('Job status sync failed for action:', action.id, error);
      }
    }
  } catch (error) {
    console.error('Job status sync error:', error);
  }
}

// IndexedDB for storing pending actions
const dbName = 'SpeedyVanDB';
const dbVersion = 1;
const storeName = 'pendingActions';

// Initialize IndexedDB
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Store pending action
async function storePendingAction(action) {
  const db = await initDB();
  const transaction = db.transaction([storeName], 'readwrite');
  const store = transaction.objectStore(storeName);

  return store.add({
    ...action,
    timestamp: Date.now(),
  });
}

// Get pending actions
async function getPendingActions() {
  const db = await initDB();
  const transaction = db.transaction([storeName], 'readonly');
  const store = transaction.objectStore(storeName);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Remove pending action
async function removePendingAction(id) {
  const db = await initDB();
  const transaction = db.transaction([storeName], 'readwrite');
  const store = transaction.objectStore(storeName);

  return store.delete(id);
}

// Message handling for main thread communication
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'STORE_ACTION') {
    event.waitUntil(storePendingAction(event.data.action));
  }
});

// Expose functions to main thread
self.getPendingActions = getPendingActions;
self.storePendingAction = storePendingAction;
self.removePendingAction = removePendingAction;
