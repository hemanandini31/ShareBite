package com.foodshare.app.sharebite.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public enum EmailType {
        REGISTRATION,
        PASSWORD_RESET
    }

    public void sendOtpEmail(String to, String otp, EmailType type) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderEmail);
            message.setTo(to);

            String subject;
            String body;

            if (type == EmailType.PASSWORD_RESET) {
                subject = "ShareBite: Password Reset Code";
                body = "Hello,\n\n"
                        + "We received a request to reset your password for your ShareBite account.\n\n"
                        + "Your Reset Verification Code (OTP) is: " + otp + "\n\n"
                        + "This code is valid for 5 minutes. If you did not request a password reset, please secure your account immediately.\n\n"
                        + "The ShareBite Team";
            } else {
                subject = "ShareBite: Email Verification Code";
                body = "Dear User,\n\n"
                        + "Thank you for joining ShareBite! \n\n"
                        + "Your One-Time Verification Code (OTP) is: " + otp + "\n\n"
                        + "This code is valid for 5 minutes. Please use it to complete your registration.\n\n"
                        + "Happy Sharing,\n"
                        + "The ShareBite Team";
            }

            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Error sending " + type + " email to " + to + ": " + e.getMessage());
        }
    }
}