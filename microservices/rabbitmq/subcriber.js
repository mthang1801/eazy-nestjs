const amqp = require('amqplib');

(async function connect() {
  try {
    const connection = amqp.connect('amqp://localhost:5672');
    const channel = await (await connection).createChannel();
    channel.consume('jobs', (message) => {
      console.log(message.content.toString());
      channel.ack(message, true);
    });
  } catch (error) {
    console.error(ex);
  }
})();
