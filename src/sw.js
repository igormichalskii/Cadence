import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', function(event) {
    const data = event.data.json()
    self.registration.showNotification(data.title, {
        body: data.body
    })
})