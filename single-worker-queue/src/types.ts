export enum Distance {
  TEN = "10",
  HALF = "half",
  FULL = "full",
}

export interface Bindings {
  DATABASE_URL: string;
  RESEND_API: string;
  NEWSLETTER_QUEUE: Queue;
  SIGN_UP_QUEUE: Queue;
}

export interface RunnerData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  distance: Distance;
}

export interface NewsletterMessage {
  email: string;
  firstName: string;
  newsletterText: string;
  subject: string;
}
