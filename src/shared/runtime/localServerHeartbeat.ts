const LOCAL_SERVER_PORT_MIN = 5190;
const LOCAL_SERVER_PORT_MAX = 5289;
const HEARTBEAT_PATH = '/__guitar_training_heartbeat';
const PAGE_CLOSED_PATH = '/__guitar_training_page_closed';
const HEARTBEAT_INTERVAL_MS = 5000;

function isManagedLocalServer() {
  const { hostname, port } = window.location;
  const numericPort = Number(port);

  return (
    (hostname === '127.0.0.1' || hostname === 'localhost') &&
    numericPort >= LOCAL_SERVER_PORT_MIN &&
    numericPort <= LOCAL_SERVER_PORT_MAX
  );
}

function sendHeartbeat() {
  fetch(HEARTBEAT_PATH, {
    method: 'POST',
    cache: 'no-store',
    keepalive: true,
  }).catch(() => {
    // The app can also be served by ordinary static hosts that do not implement this endpoint.
  });
}

function sendPageClosed() {
  const payload = new Blob(['closed'], { type: 'text/plain' });
  if (navigator.sendBeacon?.(PAGE_CLOSED_PATH, payload)) {
    return;
  }

  fetch(PAGE_CLOSED_PATH, {
    method: 'POST',
    body: payload,
    cache: 'no-store',
    keepalive: true,
  }).catch(() => {
    // Best effort only: the heartbeat timeout still handles missed close signals.
  });
}

export function startLocalServerHeartbeat() {
  if (!isManagedLocalServer()) {
    return;
  }

  sendHeartbeat();
  window.setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
  window.addEventListener('focus', sendHeartbeat);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      sendHeartbeat();
    }
  });
  window.addEventListener('pagehide', sendPageClosed);
}
