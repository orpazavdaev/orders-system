import amqp, { type Channel, type ChannelModel } from "amqplib";
import { getRabbitMQUrl } from "./config";

const MAX_CONNECTION_RETRIES = Number(
  process.env.RABBITMQ_CONNECT_RETRIES ?? 5
);
const RETRY_BASE_DELAY_MS = Number(
  process.env.RABBITMQ_CONNECT_RETRY_DELAY_MS ?? 1000
);

let connection: ChannelModel | null = null;
let connecting: Promise<ChannelModel> | null = null;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function attachConnectionHandlers(conn: ChannelModel): void {
  conn.on("error", (error) => {
    console.error("RabbitMQ connection error:", error);
    connection = null;
  });

  conn.on("close", () => {
    connection = null;
  });
}

async function connectWithRetry(): Promise<ChannelModel> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_CONNECTION_RETRIES; attempt++) {
    try {
      const conn = await amqp.connect(getRabbitMQUrl());
      attachConnectionHandlers(conn);
      return conn;
    } catch (error) {
      lastError = error;
      console.error(`RabbitMQ connect attempt ${attempt} failed`);

      if (attempt < MAX_CONNECTION_RETRIES) {
        await sleep(RETRY_BASE_DELAY_MS * attempt);
      }
    }
  }

  throw new Error(
    `Failed to connect to RabbitMQ after ${MAX_CONNECTION_RETRIES} attempts`,
    { cause: lastError }
  );
}

export async function getConnection(): Promise<ChannelModel> {
  if (connection) {
    return connection;
  }

  if (!connecting) {
    connecting = connectWithRetry().finally(() => {
      connecting = null;
    });
  }

  connection = await connecting;
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
