import * as amqplib from 'amqplib';

export const replyRpcNamedConnectionCallbackError = (
  channel: amqplib.Channel,
  msg: amqplib.ConsumeMessage,
  error: any,
) => {
  const { correlationId, replyTo } = msg.properties;
  const { content: message } = msg;
  if (replyTo) {
    if (error instanceof Error) {
      error = error.message;
    } else {
      error = JSON.stringify(error);
    }
  }
  error = Buffer.from(
    JSON.stringify({
      status: 'failed',
      statusCode: 200,
      dataRequest: JSON.parse(Buffer.from(message).toString()),
      timestamp: new Date().toLocaleString('vn'),
    }),
  );

  channel.publish('', replyTo, error, { correlationId });
  channel.ack(msg);
};
