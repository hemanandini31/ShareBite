package com.foodshare.app.sharebite.service;

import com.foodshare.app.sharebite.service.EmailService.EmailType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    private final String senderEmail = "sharebite02@gmail.com";
    private final String recipientEmail = "user@example.com";
    private final String otpCode = "123456";

    @BeforeEach
    void setUp() {
        // Set the private @Value field for the sender email
        ReflectionTestUtils.setField(emailService, "senderEmail", senderEmail);
    }

    @Test
    void sendOtpEmail_Registration_Success() {
        // Arrange
        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);

        // Act
        emailService.sendOtpEmail(recipientEmail, otpCode, EmailType.REGISTRATION);

        // Assert
        verify(mailSender, times(1)).send(messageCaptor.capture());
        SimpleMailMessage sentMessage = messageCaptor.getValue();

        assertEquals(senderEmail, sentMessage.getFrom());
        assertEquals(recipientEmail, sentMessage.getTo()[0]);
        assertEquals("ShareBite: Email Verification Code", sentMessage.getSubject());
        assertTrue(sentMessage.getText().contains("joining ShareBite"));
        assertTrue(sentMessage.getText().contains(otpCode));
    }

    @Test
    void sendOtpEmail_PasswordReset_Success() {
        // Arrange
        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);

        // Act
        emailService.sendOtpEmail(recipientEmail, otpCode, EmailType.PASSWORD_RESET);

        // Assert
        verify(mailSender, times(1)).send(messageCaptor.capture());
        SimpleMailMessage sentMessage = messageCaptor.getValue();

        assertEquals("ShareBite: Password Reset Code", sentMessage.getSubject());
        assertTrue(sentMessage.getText().contains("reset your password"));
        assertTrue(sentMessage.getText().contains(otpCode));
    }

    @Test
    void sendOtpEmail_HandlesExceptionGracefully() {
        // Arrange
        doThrow(new RuntimeException("SMTP Server Down")).when(mailSender).send(any(SimpleMailMessage.class));

        // Act & Assert
        // We assert doesNotThrow because the service catches the exception and logs it to stderr
        assertDoesNotThrow(() -> {
            emailService.sendOtpEmail(recipientEmail, otpCode, EmailType.REGISTRATION);
        });

        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }
}