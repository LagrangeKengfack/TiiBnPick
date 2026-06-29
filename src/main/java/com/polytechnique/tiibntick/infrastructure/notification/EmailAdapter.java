package com.polytechnique.tiibntick.infrastructure.notification;

import com.polytechnique.tiibntick.domain.port.out.EmailPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

/**
 * Outbound adapter: implements the EmailPort using JavaMailSender (Gmail SMTP).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EmailAdapter implements EmailPort {

    private final JavaMailSender emailSender;

    private void sendSimpleMessage(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            message.setFrom("noreply@tiibntick.com");
            emailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (MailException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    @Override
    public Mono<Void> sendSimpleMessageReactive(String to, String subject, String text) {
        return Mono.fromRunnable(() -> sendSimpleMessage(to, subject, text))
                .subscribeOn(Schedulers.boundedElastic())
                .then();
    }

    @Override
    public void sendRegistrationReceived(String to) {
        sendSimpleMessage(to, "TiiBnTick - Inscription reçue",
                "Bonjour,\n\nVotre demande d'inscription en tant que livreur a bien été reçue.\n\n" +
                "Votre compte est en attente de validation par notre équipe administrative.\n" +
                "Un email vous sera envoyé lorsque votre demande aura été examinée.\n\n" +
                "Cordialement,\nL'équipe TiiBnTick");
    }

    @Override
    public void sendAccountApproved(String to) {
        sendSimpleMessage(to, "TiiBnTick - Compte approuvé",
                "Bonjour,\n\nFélicitations ! Votre compte livreur a été approuvé.\n\n" +
                "Vous pouvez maintenant vous connecter à l'application et commencer à effectuer des livraisons.\n\n" +
                "Cordialement,\nL'équipe TiiBnTick");
    }

    @Override
    public void sendAccountRejected(String to, String reason) {
        String reasonText = (reason != null && !reason.isEmpty()) ? "\nRaison : " + reason + "\n" : "";
        sendSimpleMessage(to, "TiiBnTick - Demande d'inscription refusée",
                "Bonjour,\n\nNous avons le regret de vous informer que votre demande d'inscription " +
                "en tant que livreur n'a pas été approuvée.\n" + reasonText +
                "\nSi vous pensez qu'il s'agit d'une erreur, veuillez nous contacter.\n\n" +
                "Cordialement,\nL'équipe TiiBnTick");
    }

    @Override
    public void sendAccountSuspended(String to) {
        sendSimpleMessage(to, "TiiBnTick - Compte suspendu",
                "Bonjour,\n\nNous vous informons que votre compte livreur a été temporairement suspendu.\n\n" +
                "Durant cette période, vous ne pourrez pas accéder aux fonctionnalités de l'application.\n\n" +
                "Cordialement,\nL'équipe TiiBnTick");
    }

    @Override
    public void sendAccountRevoked(String to) {
        sendSimpleMessage(to, "TiiBnTick - Compte révoqué",
                "Bonjour,\n\nNous vous informons que votre compte livreur a été définitivement révoqué.\n\n" +
                "Cette décision est irrévocable et vous ne pourrez plus accéder à l'application.\n\n" +
                "Cordialement,\nL'équipe TiiBnTick");
    }

    @Override
    public void sendDeliveryAssigned(String to, String announcementTitle) {
        sendSimpleMessage(to, "TiiBnTick - Livraison assignée",
                "Bonjour,\n\nFélicitations ! Vous avez été sélectionné(e) pour effectuer la livraison suivante :\n\n" +
                "\"" + announcementTitle + "\"\n\n" +
                "Veuillez vous connecter à l'application pour consulter les détails de la livraison.\n\n" +
                "Cordialement,\nL'équipe TiiBnTick");
    }
}
