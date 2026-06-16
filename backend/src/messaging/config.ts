export interface RabbitMQConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  vhost: string;
}

export function getRabbitMQConfig(): RabbitMQConfig {
  return {
    host: process.env.RABBITMQ_HOST ?? "localhost",
    port: Number(process.env.RABBITMQ_PORT ?? 5672),
    user: process.env.RABBITMQ_USER ?? "orders",
    password: process.env.RABBITMQ_PASSWORD ?? "orders",
    vhost: process.env.RABBITMQ_VHOST ?? "/",
  };
}

export function getRabbitMQUrl(): string {
  if (process.env.RABBITMQ_URL) {
    return process.env.RABBITMQ_URL;
  }

  const config = getRabbitMQConfig();
  const encodedVhost = encodeURIComponent(config.vhost);

  return `amqp://${config.user}:${config.password}@${config.host}:${config.port}/${encodedVhost}`;
}
