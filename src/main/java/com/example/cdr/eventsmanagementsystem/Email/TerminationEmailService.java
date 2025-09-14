package com.example.cdr.eventsmanagementsystem.Email;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.Nullable;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class TerminationEmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@example.com}")
    private String from;

    @Value("${app.name:Events Management System}")
    private String appName;

    @Value("${app.supportEmail:support@example.com}")
    private String supportEmail;

    public TerminationEmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendAccountTerminationEmail(String toEmail, String username, @Nullable String reason) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            helper.setFrom(from);
            helper.setTo(toEmail);
            helper.setSubject("Notice of Account Termination – " + appName);

            String when = ZonedDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm z"));
            String safeReason = (reason == null || reason.isBlank()) ? "No specific reason was provided." : escape(reason);

            String body = """
                <p>Dear %s,</p>
                <p>We’re writing to inform you that your account (<strong>%s</strong>) with <em>%s</em> has been terminated by an administrator, effective <strong>%s</strong>.</p>
                <p><strong>Reason provided:</strong></p>
                <blockquote style="margin:0 0 1em 0;border-left:4px solid #ddd;padding-left:12px;white-space:pre-wrap;">%s</blockquote>
                <p><strong>What this means</strong></p>
                <ul>
                  <li>You will no longer be able to sign in or access your bookings or saved information.</li>
                  <li>Any future bookings associated with your account may be cancelled, where applicable.</li>
                </ul>
                <p>If you believe this action is in error or wish to appeal, please contact our support team within 14 days at
                <a href="mailto:%s">%s</a> and include your username and any relevant details.</p>
                <p>Sincerely,<br/>The %s Team</p>
                """.formatted(escape(username), escape(username), escape(appName), when, safeReason, supportEmail, supportEmail, escape(appName));

            helper.setText(body, true);
            mailSender.send(message);
        } catch (Exception e) {
            // Don’t block deletion on mail failure; log if you have a logger
        }
    }

    private String escape(String s) {
        return s.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;");
    }
}
