export const ReferAFriendTemplate = (data: {
    college_id: string;
    college_name: string;
    college_location: string;
    college_image_url: string;
    sender_name: string;
    sender_email: string;
    notes: string;
    college_url: string;
    user_email: string;
  }
) => `
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
    <p>${data.sender_name} would like to share a college with you</p>
    <h2>${data.college_name}</h2>
    <p><strong>Location:</strong> ${data.college_location}</p>
    <p><strong>Notes:</strong> ${data.notes}</p>
    <p><strong>Check it out:</strong> <a href="${data.college_url}">${data.college_url}</a></p>
    <p><strong>Shared by:</strong> ${data.sender_name} (${data.sender_email})</p>
    <img src="${data.college_image_url}" alt="${data.college_name}" style="max-width: 100%; height: 300px;border-radius: 8px;">
    <p>&nbsp;</p>
    
    <p>We hope you find this college interesting!</p>
    <p>If you have any questions or need further information, feel free to reach out.</p>
    
    <p>&nbsp;</p>
    <p>&nbsp;</p>
    <p>Best regards,<br>Admin Team</p>
    
  </div>
</body>
</html>`;