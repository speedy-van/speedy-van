import Pusher from "pusher";

// Lazily create a singleton to avoid throwing during build when env vars are not set
let _pusherServer: Pusher | null = null;

export function getPusherServer(): Pusher {
  if (_pusherServer) return _pusherServer;

  const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER } = process.env;
  if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET || !PUSHER_CLUSTER) {
    throw new Error('Pusher server is not configured. Missing PUSHER_* env vars.');
  }

  _pusherServer = new Pusher({
    appId: PUSHER_APP_ID,
    key: PUSHER_KEY,
    secret: PUSHER_SECRET,
    cluster: PUSHER_CLUSTER,
    useTLS: true,
  });

  return _pusherServer;
}


