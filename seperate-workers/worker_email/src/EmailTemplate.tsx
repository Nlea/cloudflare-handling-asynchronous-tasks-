// biome-ignore lint/style/useImportType: <explanation>
import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
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

export default EmailTemplate;
