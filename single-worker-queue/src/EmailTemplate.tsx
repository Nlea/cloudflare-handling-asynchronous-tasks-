import type * as React from "react";

interface SignupTemplateProps {
  firstName: string;
}

export const SignupTemplate: React.FC<Readonly<SignupTemplateProps>> = ({
  firstName,
}) => (
  <div>
    <h1>Hello, {firstName}!</h1>
    <div>
      Thanks for signing up to the race! You will receive more information
      closer to the date.
    </div>
  </div>
);

interface NewsletterTemplateProps {
  firstName: string;
  newsletterText: string;
}

export const NewsletterTemplate: React.FC<Readonly<NewsletterTemplateProps>> = ({
  firstName,
  newsletterText,
}) => (
  <div>
    <h1>Hello, {firstName}!</h1>
    <div>
      {newsletterText}
    </div>
  </div>
);
