import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { ContactDto } from './dto/contact.dto';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailService } from 'src/email/email.service';
import { contactAdminTemplate } from 'src/email/templates/contact-admin.template';
import { contactThankyouTemplate } from 'src/email/templates/contact-thankyou.template';

@Injectable()
export class ContactService {
  private readonly transporter: any;
  private readonly adminEmail: string;

  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {
    this.adminEmail = this.configService.get('ADMIN_EMAIL');
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: this.configService.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async create(contactDto: ContactDto): Promise<Contact> {
    const contact = this.contactRepository.create(contactDto);
    const savedContact = await this.contactRepository.save(contact);

    const contactData = {
        fullName: contactDto.name,
        email: contactDto.email,
        mobile: contactDto.phone,
        subject: contactDto.subject,
        message: contactDto.message,
    };
    // Send email notification to admin
      await this.emailService.sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: 'New Contact Form Submission',
          html: contactAdminTemplate(contactData),
      });

      
    // Send thank you email to user
    //await this.sendThankYouEmail(contactDto.email, contactDto.name);
    await this.emailService.sendEmail({
        to: contactData.email,
        subject: 'Thank you for contacting us',
        html: contactThankyouTemplate(contactData),
    });
    // Send notification to admin
    //await this.sendAdminNotification(contactDto);

    return savedContact;
  }

  private async sendThankYouEmail(email: string, name: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get('SMTP_FROM'),
      to: email,
      subject: 'Thank you for contacting us',
      html: `
        <h2>Thank you for reaching out!</h2>
        <p>Dear ${name},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p>Best regards,<br>Your Team</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }



  private async sendAdminNotification(contact: ContactDto): Promise<void> {
    const mailOptions = {
      from: this.configService.get('SMTP_FROM'),
      to: this.adminEmail,
      subject: 'New Contact Form Submission',
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${contact.name}</p>
        <p><strong>Email:</strong> ${contact.email}</p>
        <p><strong>Phone:</strong> ${contact.phone}</p>
        <p><strong>Subject:</strong> ${contact.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${contact.message}</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}