import amqplib from "amqplib";

export const handler = async (event) => {
  try {
    const connection = await amqplib.connect(process.env.RABBIT_MQ_URL);

    const toCompleteChannel = await connection.createChannel();

    const IMAGES_TO_PROCESS_EXCHANGE = "images-to-process-exchange";

    await toCompleteChannel.assertExchange(
      IMAGES_TO_PROCESS_EXCHANGE,
      "fanout",
      {
        durable: false,
      }
    );

    const key = decodeURIComponent(
      event.Records[0].s3.object.key.replace(/\+/g, " ")
    );

    const payload = { fileName: key };

    toCompleteChannel.publish(
      IMAGES_TO_PROCESS_EXCHANGE,
      "",
      Buffer.from(JSON.stringify(payload))
    );

    const response = {
      statusCode: 200,
      body: JSON.stringify("Hello from Lambda! Event published: ", payload),
    };

    return response;
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
};
