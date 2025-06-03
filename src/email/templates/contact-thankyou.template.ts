export const contactThankyouTemplate = (data: {
  fullName: string;
  email: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      background-color: #f4f4f4;
    }
    h2 {
      color: #333;
    }
    p {
      color: #555;
    }
    ul {
      list-style-type: none;
      padding: 0;
    }
    li {
      margin: 5px 0;
    }
      </style>
</head>
<body>
  <p class=''>Dear ${data.fullName},</p>
  <p>Thank you for reaching out to us! We have received your message and will get back to you as soon as possible.</p>
  <p>If you have any urgent questions, feel free to reply to this email or contact us at our support number.</p>
  <p>Best regards,<br>Admin Team</p>
</body>
</html>
`;