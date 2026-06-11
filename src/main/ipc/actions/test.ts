import { tipc } from '@egoist/tipc/main';

const t = tipc.create();

const ping = t.procedure.action(async () => {
  console.log('pong');

  return Promise.resolve();
});

export const testRouter = {
  ping,
};
