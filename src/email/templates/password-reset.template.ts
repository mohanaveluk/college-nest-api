export const passwordResetTemplate = (resetLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    .container {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .button {
      background-color: #6828d9;
      border: none;
      color: white !important;
      padding: 15px 32px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;
      margin: 4px 2px;
      cursor: pointer;
      border-radius: 4px;
    }
    .ii a[href] {
      color: #ffffff !important;
      font-weight: 600;
      text-decoration: none;
    }
    
    .im {
      color: #000000; 
    }


  </style>
</head>
<body>
  <div class="container">
    <h2>Password Reset Request</h2>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <p>
      <a href="${resetLink}" class="button">Reset Password</a>
    </p>
    <p>If you didn't request this password reset, you can safely ignore this email.</p>
    <p>This link will expire in 1 hour for security reasons.</p>
    <p></p>
    <p></p>
    
    <p>Best regards,<br>Your Application Team</p>
  </div>
</body>
</html>`;