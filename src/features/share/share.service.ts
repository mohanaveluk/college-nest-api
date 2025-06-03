import { Injectable } from "@nestjs/common";
import { CollegeService } from "../college/college.service";
import { CreateShareDto } from "./dto/create-share.dto";
import { EmailService } from "src/email/email.service";
import { ShareResponseDto } from "./dto/share-response.dto";
import { AuthService } from "src/auth/auth.service";
import { ReferAFriendTemplate } from "src/email/templates/refer-a-friend.template";
import { ShareAFriendTemplate } from "src/email/templates/share-a-friend.template";

@Injectable()
export class ShareService {
  constructor(
    private readonly collegeService: CollegeService,
    private readonly authService: AuthService,
    private readonly emailService: EmailService,

  ) {}

  async create(userId: string, createShareDto: CreateShareDto): Promise<ShareResponseDto> {
    //const createdShare = new this.shareModel(createShareDto);
    //return createdShare.save();
    const user = await this.authService.getUserInfo(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const { college_id, email } = createShareDto;
    const college = await this.collegeService.findOne(college_id);
    if (!college) {
      throw new Error(`College with ID ${college_id} not found`);
    }

    const shareResponse: ShareResponseDto = {
        college_id: college.id,
        college_name: college.name,
        email: email,
        url: createShareDto.url,
        notes: createShareDto.notes || '',
        status: "",
        shareId: "",
        userEmail: ""
    };

    // Send email with share details
    try {
        const data = {
            college_id: college.id,
            college_name: college.name,
            college_location: college.city + ', ' + college.state.name,
            college_image_url: college.image_url || 'https://www.smith.edu/sites/default/files/styles/content_faculty_profile_full_xlarge/public/2023-08/placeholder-image.png.webp?itok=DWJy3nsA',
            college_url: createShareDto.url || '',
            notes: createShareDto.notes || '',
            sender_name: `${user.first_name} ${user.last_name}`,
            sender_email: user.email,
            user_email: college.email,
        }

        const mailOptions  = {
            to: email,
            subject: `${user.first_name} ${user.last_name} Recommends a College That Might Be Perfect for You`,
            html: ShareAFriendTemplate(data)
        }; // Construct the email content as needed

        await this.emailService.sendEmail(mailOptions);

        shareResponse.status = 'success';
        }
    catch (error) {
        shareResponse.status = 'error';
        console.error('Error sending email:', error);
    }

    return {
      ...shareResponse,
        shareId: 'generated-share-id', // Replace with actual logic to generate a share ID
        created_at: new Date(),
    }
  }

  async findAll(): Promise<ShareResponseDto[]> {
    return null;
  }

  async findOne(id: string): Promise<ShareResponseDto> {
    return null;
  }



}