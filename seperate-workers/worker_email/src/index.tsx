import { WorkerEntrypoint } from "cloudflare:workers";
import React from "react";
import { Resend } from "resend";
import { EmailTemplate } from "./EmailTemplate";
import { Context } from "hono";

export interface Env {
  RESEND_API: string;
}

export class WorkerEmail extends WorkerEntrypoint {
  // Currently, entrypoints without a named handler are not supported

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/send" && request.method === "POST") {
      const { email, firstName }: { email: string; firstName: string } =
        await request.json();
      return this.send(email, firstName);
    }
    return new Response(null, { status: 404 });
  }

  
  async send(email: string, firstName: string): Promise<Response> {
    const env = this.env as Env;
    const resend = new Resend(env.RESEND_API);

    const data = await resend.emails.send({
      from: "Fiberplane <community@updates.fp.dev>",
      to: [email],
      subject: "Your signed up for the marathon!",
      react: <EmailTemplate firstName={firstName} />,
    });
    console.log(`Email sent to: ${firstName}`);

    return Response.json(data);
  }

  
  // Queue consumer
  async queue(batch: MessageBatch): Promise<void> {
    for (const message of batch.messages) {
      console.log("Received", message.body);
      const { email, firstName } = JSON.parse(message.body as string);
      await this.send(email, firstName);
    }
  }
}


export default WorkerEmail;



