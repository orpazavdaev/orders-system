import amqp, { type Channel, type ChannelModel } from "amqplib";
import { getRabbitMQUrl } from "./config";

let connection: ChannelModel | null = null;

export async function getConnection(): Promise<ChannelModel> {
  if (!connection) {
    connection = await amqp.connect(getRabbitMQUrl());

    connection.on("error", (error) => {
      console.error("RabbitMQ connection error:", error);
      connection = null;
    });

    connection.on("close", () => {
      connection = null;
    });
  }

  return connection;
}

export async function createChannel(): Promise<Channel> {
  const conn = await getConnection();
  return conn.createChannel();
}

export async function closeConnection(): Promise<void> {
  if (connection) {
    await connection.close();
    connection = null;
  }
}
