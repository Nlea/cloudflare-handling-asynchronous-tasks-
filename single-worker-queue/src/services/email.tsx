import { Resend } from "resend";
import { SignupTemplate, NewsletterTemplate } from "../EmailTemplate";

export async function sendSignUpMail(email: string, apikey: string, firstName: string) {
  const resend = new Resend(apikey);
  const { error } = await resend.emails.send({
    from: "Marathon Updates <community@updates.fp.dev>",
    to: [email],
    subject: "Your signed up for the marathon!",
    react: <SignupTemplate firstName={firstName} />,
  });

  if (error) {
    console.error("Error sending email", error);
  }
}

export async function sendNewsletterMail(
  email: string, 
  apikey: string, 
  firstName: string, 
  newsletterText: string,
  subject: string
) {
  const resend = new Resend(apikey);
  const { error } = await resend.emails.send({
    from: "Marathon Updates <community@updates.fp.dev>",
    to: [email],
    subject: subject,
    react: <NewsletterTemplate firstName={firstName} newsletterText={newsletterText} />,
  });

  if (error) {
    console.error("Error sending email", error);
  }
}
