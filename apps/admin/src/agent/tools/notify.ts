import { z } from 'zod';
// import Pusher from 'pusher';
// const pusher = new Pusher({ appId: process.env.PUSHER_APP_ID!, key: process.env.PUSHER_KEY!, secret: process.env.PUSHER_SECRET!, cluster: process.env.PUSHER_CLUSTER!, useTLS: true });

const Input = z.object({ channel: z.string(), event: z.string(), payload: z.record(z.string(), z.any()) });

export async function toolNotify(input: unknown) {
  const { channel, event, payload } = Input.parse(input);
  // await pusher.trigger(channel, event, payload);
  return { ok: true, data: { channel, event } };
}

