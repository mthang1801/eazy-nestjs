const amqp = require('amqplib');

(async function connect() {
  try {
    const connection = amqp.connect('amqp://localhost:5672');
    const channel = await (await connection).createChannel();
    const result = await channel.assertQueue('jobs');

    for (let i = 0; i < 50; i++) {
      channel.sendToQueue(
        'jobs',
        Buffer.from(`Hi it works ${new Date()}-${Math.random() * 10000000}`),
      );
    }
  } catch (error) {
    console.log(error);
  }
})();
