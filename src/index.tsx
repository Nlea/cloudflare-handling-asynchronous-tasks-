import { instrument } from "@fiberplane/hono-otel";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Hono } from "hono";
import { Resend } from "resend";
import { runners } from "./db/schema";
import { EmailTemplate } from "./email_template";

type Bindings = {
  DATABASE_URL: string;
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
  await sendMail(email, c.env.RESEND_API, firstName);

  return c.text("Thanks for registering for our Marathon", 200);
});

app.post("/api/marathon-fire-and-forget", async (c) => {
  const { firstName, lastName, email, address, distance } = await c.req.json();

  await insertData(
    firstName,
    lastName,
    email,
    address,
    distance,
    c.env.DATABASE_URL,
  ).catch(console.error);

  sendMail(email, c.env.RESEND_API, firstName).catch(console.error);

  return c.text("Thanks for registering for our Marathon", 201);
});

app.post("/api/marathon-waituntil", async (c) => {
  const { firstName, lastName, email, address, distance } = await c.req.json();

  await insertData(
    firstName,
    lastName,
    email,
    address,
    distance,
    c.env.DATABASE_URL,
  ).catch(console.error);
  c.executionCtx.waitUntil(sendMail(email, c.env.RESEND_API, firstName));

  return c.text("Thanks for registering for our Marathon", 201);
});

async function sendMail(email: string, apikey: string, firstName: string) {
  const resend = new Resend(apikey);
  const { error } = await resend.emails.send({
    from: "Fiberplane <community@updates.fp.dev>",
    to: [email],
    subject: "Your signed up for the marathon!",
    react: <EmailTemplate firstName={firstName} />,
  });

  if (error) {
    console.error("Error sending email", error);
  }
}

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
