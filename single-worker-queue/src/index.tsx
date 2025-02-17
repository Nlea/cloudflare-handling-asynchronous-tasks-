import { instrument } from "@fiberplane/hono-otel";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Hono } from "hono";
import { runners } from "./db/schema";
import { MessageBatch } from "@cloudflare/workers-types";
import { sendSignUpMail, sendNewsletterMail } from "./services/email";
import { Distance, Bindings, RunnerData, NewsletterMessage } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/api/marathon-sign-up", async (c) => {
  const { firstName, lastName, email, address, distance } = await c.req.json<RunnerData>();

  await insertData(
    firstName,
    lastName,
    email,
    address,
    distance,
    c.env.DATABASE_URL,
  );

  c.executionCtx.waitUntil(c.env.SIGN_UP_QUEUE.send({
    email,
    firstName,
  }));

  return c.text("Thanks for registering for our Marathon", 201);
});

app.post("/api/send-newsletter", async (c) => {
  const { newsletterText, subject } = await c.req.json();
  
  if (!newsletterText || !subject) {
    return c.json({ error: "Newsletter text and subject are required" }, 400);
  }
  
  // Connect to the database
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);
  
  // Fetch all registered users
  const allUsers = await db.select().from(runners);
  
  // Send newsletter to each user
  for (const user of allUsers) {
    try {
      console.log(`Sending message to queue for user: ${user.firstName} (${user.email})`);
      await c.env.NEWSLETTER_QUEUE.send({
        email: user.email,
        firstName: user.firstName,
        newsletterText,
        subject
      });
    } catch (error) {
      console.error(`Failed to send newsletter to ${user.email}:`, error);
    }
  }

  return c.json({ 
    message: `Newsletter queued for ${allUsers.length} recipients`,
    status: "success" 
  });
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

async function handleSignUpMessage(message: Message<RunnerData>, env: Bindings) {
  console.log(`Sign-up queue`);
  const runnerData = message.body;
  try {
    await sendSignUpMail(runnerData.email, env.RESEND_API, runnerData.firstName);
    message.ack();
  } catch(error) {
    console.error(`Failed to process message:`, error);
  }
}

async function handleNewsletterMessage(message: Message<NewsletterMessage>, env: Bindings) {
  console.log(`Newsletter queue`);
  const newsletterData = message.body;
  try {
    await sendNewsletterMail(
      newsletterData.email,
      env.RESEND_API,
      newsletterData.firstName,
      newsletterData.newsletterText,
      newsletterData.subject
    );
    message.ack();
  } catch (error) {
    console.error(`Failed to process newsletter message:`, error);
  }
}

export default {
  fetch: instrument(app).fetch,
  async queue(batch: MessageBatch<NewsletterMessage | RunnerData>, env: Bindings) {
    batch.messages.forEach(async (message) => {
      switch (batch.queue) {
        case 'sign-up-queue':
          await handleSignUpMessage(message as Message<RunnerData>, env);
          break;
        
        case 'newsletter-queue':
          await handleNewsletterMessage(message as Message<NewsletterMessage>, env);
          break;
      }
    });
  }
};
