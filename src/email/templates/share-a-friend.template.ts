export const ShareAFriendTemplate = (data: {
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

<body style="margin:0; padding:0; background-color:#f4f4f4;font-size:15px; line-height:1.5; color:#333333;">
  <center>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f4f4; padding:20px 0;">
      <tr>
        <td align="center">
          <!--[if mso]>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600">
          <tr>
          <td>
          <![endif]-->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <tr>
              <td style="padding:20px; font-family:Arial, sans-serif; color:#333333;">
                <p style="margin-top:0;">
                Your friend, John Doe, thought you might be interested in exploring a college that aligns with your academic and career aspirations.
                </p>
                <p>&nbsp;</p>
                <h3 style="margin-bottom:5px;">${data.college_name}</h3>
                <p style="margin-top:0;">📍 ${data.college_location}</p>
                <img src="${data.college_image_url}" alt="${data.college_name}" style="max-width: 100%; height: 50px;border-radius: 4px;">
                <p>John mentioned that this institution could be a great fit for you.</p>
                <p>${data.notes}</p>
                <h4>Why consider this college?</h4>
                <ul>
                  <li><strong>Relevant Courses</strong>: Offers programs in Computer Science, Electronics & Communication, Electrical & Electronics, and Mechanical Engineering.</li>
                  <li><strong>Proximity</strong>: Located near your area, making it convenient for commuting or relocation.</li>
                  <li><strong>Positive Reviews</strong>: Students have praised the college for its infrastructure and faculty.</li>
                  <li><strong>Modern Facilities</strong>: Equipped with hi-tech labs, free Wi-Fi, and sports amenities.</li>
                </ul>
                <p>👉 <a href="${data.college_url}"  style="color:#1a73e8; text-decoration:none;">Explore the College</a></p>
                <p><strong>Shared by:</strong> ${data.sender_name} (<a href="mailto:${data.sender_email}" style="color:#1a73e8; text-decoration:none;">${data.sender_email}</a>)</p>
                <p>&nbsp;</p>
                <p>We hope you find this college interesting!</p>
                <p>If you have any questions or need further information, feel free to reach out.</p>
                <p>&nbsp;</p>
                <p>&nbsp;</p>
                <p>Best regards,<br>
                Admin Team</p>
              </td>
            </tr>
          </table>
          <!--[if mso]>
          </td>
          </tr>
          </table>
          <![endif]-->
        </td>
      </tr>
    </table>
  </center>
</body>

</html>`;