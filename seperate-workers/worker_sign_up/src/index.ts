import { instrument } from "@fiberplane/hono-otel";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { Env } from "hono";
import { Hono } from "hono";
import { runners } from "./db/schema";

export interface WorkerEmail {
  fetch(request: Request): Promise<Response>;
  send(email: string, firstName: string): Promise<Response>;
}

type Bindings = {
  DATABASE_URL: string;
  WORKER_EMAIL: WorkerEmail;
  REGISTRATION_QUEUE: Queue;
  RESEND_API: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

enum Distance {
  TEN = "10",
  HALF = "half",
  FULL = "full",
}

app.post("/api/marathon-sequential", async (c) => {
  const { firstName, lastName, email, address, distance } = await c.req.json();

  await insertData(
    firstName,
    lastName,
    email,
    address,
    distance,
    c.env.DATABASE_URL,
  );


  //using rpc
  await c.env.WORKER_EMAIL.send(email, firstName);

  //using fetch

  //  await c.env.WORKER_EMAIL.fetch(
  //   new Request("https://worker-email/send", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ email, firstName }),
  //   })
  // )

  return c.text("Thanks for registering for our Marathon", 200);
});

app.post("/api/marathon-wait-until", async (c) => {
  const { firstName, lastName, email, address, distance } = await c.req.json();

  //using rpc
  c.executionCtx.waitUntil(c.env.WORKER_EMAIL.send(email, firstName));

  //using fetch

  // c.executionCtx.waitUntil(
  //   c.env.WORKER_EMAIL.fetch(
  //     new Request("https://worker-email/send", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email, firstName }),
  //     })
  //   )
  // );

  await insertData(
    firstName,
    lastName,
    email,
    address,
    distance,
    c.env.DATABASE_URL,
  );

  return c.text("Thanks for registering for our Marathon", 200);
});

app.post("/api/marathon-producer-queue", async (c) => {
  const { firstName, lastName, email, address, distance } = await c.req.json();

  const messagePayload = {
    firstName: firstName,
    email: email,
  };

  const messageBody = JSON.stringify(messagePayload);


  //produce a message for the Queue
  console.log("Sending message to queue");
  await c.env.REGISTRATION_QUEUE.send(messageBody);

  await insertData(
    firstName,
    lastName,
    email,
    address,
    distance,
    c.env.DATABASE_URL,
  );

  return c.text("Thanks for registering for our Marathon", 200);
});

async function insertData(
  firstName: string,
  lastName: string,
  email: string,
  address: string,
  distance: Distance,
  apikey_db: string,
) {
  const sql = neon(apikey_db);
  const db = drizzle(sql);

  await db
    .insert(runners)
    .values({
      firstName: firstName,
      lastName: lastName,
      email: email,
      address: address,
      distance: distance,
    })
    .onConflictDoNothing()
    .execute();
}


export default instrument(app);

//use this code, if you want to test the queue logic locally. At the moment Cloudflare Workers doesn't support two seperate local workers to communicate with one local queue.
//Also make sure that you put in the consumer logic in the wrangler.toml file fo testing locally.

// export default{
//   fetch: app.fetch,

//   async queue(batch:MessageBatch, env: Bindings): Promise<void> {
//          for (const msg of batch.messages) {
//          console.log(msg.body);
//          const { email, firstName } = JSON.parse(msg.body as string);
//          console.log(email, firstName);
//        }
//      }

// }

