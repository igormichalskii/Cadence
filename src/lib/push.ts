function urlBase64ToUint8Array(base64String: string): Uint8Array {
    let cleaned = base64String.replaceAll('-', '+').replaceAll('_', '/')
    const pad = '='.repeat((4 - (base64String.length % 4)) % 4)
    cleaned = cleaned.concat(pad);
    const decoded = atob(cleaned)

    return new Uint8Array(Array.from(decoded, char => char.charCodeAt(0)))
}

export async function subscribeToPush() {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    const registration = await navigator.serviceWorker.ready

    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY) as Uint8Array<ArrayBuffer>
    })

    localStorage.setItem('pushSubscription', JSON.stringify(subscription))
    return subscription
}
