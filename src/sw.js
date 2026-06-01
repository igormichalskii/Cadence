import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', function (event) {
    const data = event.data.text()
    let title = 'JARVIS'
    let body = data
    try {
        const parsed = JSON.parse(data)
        title = parsed.title
        body = parsed.body
    } catch { }
    self.registration.showNotification(title, { body })
})