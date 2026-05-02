import "./bootstrap-env";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { loadBaseEnv } from "@cxnext/config";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const env = loadBaseEnv();
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    bufferLogs: true,
  });
  let isClosing = false;

  app.enableCors({
    methods: ["GET", "HEAD", "POST", "PATCH", "DELETE", "OPTIONS"],
    origin: env.FRONTEND_URL,
  });
  app.enableShutdownHooks();

  async function shutdown(signal: string): Promise<void> {
    if (isClosing) {
      return;
    }

    isClosing = true;
    await app.close();
    process.stdout.write(`cxnext server stopped after ${signal}\n`);
  }

  process.once("SIGINT", () => {
    void shutdown("SIGINT").finally(() => process.exit(0));
  });
  process.once("SIGTERM", () => {
    void shutdown("SIGTERM").finally(() => process.exit(0));
  });

  const port = env.PORT;
  await app.listen(port, "0.0.0.0");
  process.stdout.write(`cxnext server listening on http://localhost:${port}\n`);
}

void bootstrap();
