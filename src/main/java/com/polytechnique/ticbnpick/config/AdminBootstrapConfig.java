package com.polytechnique.ticbnpick.config;

import com.polytechnique.ticbnpick.models.Person;
import com.polytechnique.ticbnpick.models.enums.PersonRole;
import com.polytechnique.ticbnpick.repositories.PersonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;
import reactor.core.publisher.Mono;

/**
 * Bootstrap configuration to create default admin on application startup.
 * 
 * This component implements ApplicationRunner which is executed after the
 * Spring context is fully initialized. It checks if an admin user already
 * exists and creates one if not, ensuring idempotent behavior across restarts.
 * 
 * Principle:
 * - ApplicationRunner executes once at startup after all beans are initialized
 * - existsByEmail() check ensures the admin is only created if it doesn't exist
 * - This is idempotent: no matter how many times the app restarts, only one admin exists
 *
 * @author TicBnPick Team
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootstrapConfig implements ApplicationRunner {

    private final PersonRepository personRepository;
    private final PasswordEncoder passwordEncoder;

    // Admin credentials
    private static final String ADMIN_EMAIL = "bernicetsafack@gmail.com";
    private static final String ADMIN_PASSWORD = "123456789";
    private static final String ADMIN_LAST_NAME = "Kengfack";
    private static final String ADMIN_FIRST_NAME = "Bernice";
    private static final String ADMIN_PHONE = "673962337";

    @Override
    public void run(ApplicationArguments args) {
        log.info("=".repeat(60));
        log.info("Checking for admin user...");
        
        personRepository.existsByEmail(ADMIN_EMAIL)
            .flatMap(exists -> {
                if (exists) {
                    log.info("Admin user already exists: {}", ADMIN_EMAIL);
                    return personRepository.findByEmail(ADMIN_EMAIL)
                            .flatMap(person -> {
                                // Ensure existing admin has the correct role
                                boolean needsUpdate = false;
                                if (!PersonRole.ADMIN.name().equals(person.getRole())) {
                                    log.info("Updating admin role from '{}' to 'ADMIN'", person.getRole());
                                    person.setRole(PersonRole.ADMIN.name());
                                    needsUpdate = true;
                                }
                                if (person.getIsActive() == null || !person.getIsActive()) {
                                    person.setIsActive(true);
                                    needsUpdate = true;
                                }
                                person.setNewEntity(false);
                                if (needsUpdate) {
                                    return personRepository.save(person);
                                }
                                return Mono.just(person);
                            });
                } else {
                    log.info("Creating admin user...");
                    Person admin = createAdminPerson();
                    return personRepository.save(admin);
                }
            })
            .doOnSuccess(person -> {
                if (person != null) {
                    log.info("Admin user ready:");
                    log.info("  Email: {}", person.getEmail());
                    log.info("  Name: {} {}", person.getFirstName(), person.getLastName());
                    log.info("  Role: {}", person.getRole());
                    log.info("=".repeat(60));
                }
            })
            .doOnError(error -> {
                log.error("Failed to initialize admin user: {}", error.getMessage());
            })
            .subscribe();
    }

    /**
     * Creates the admin Person entity with predefined values.
     *
     * @return the admin Person ready to be saved
     */
    private Person createAdminPerson() {
        Person admin = new Person();
        admin.setId(UUID.randomUUID());
        admin.setEmail(ADMIN_EMAIL);
        admin.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
        admin.setLastName(ADMIN_LAST_NAME);
        admin.setFirstName(ADMIN_FIRST_NAME);
        admin.setPhone(ADMIN_PHONE);
        admin.setRole(PersonRole.ADMIN.name());
        admin.setIsActive(true);
        
        // Generate random values for required fields
        admin.setNationalId("ADMIN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        admin.setPhotoCard("admin-photo-" + UUID.randomUUID().toString().substring(0, 8));
        admin.setNui("NUI-ADMIN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        
        // Optional fields
        admin.setRating(5.0);
        admin.setTotalDeliveries(0);
        
        return admin;
    }
}
