package com.polytechnique.ticbnpick.services.support;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.UUID;

/**
 * Service to handle file storage on the server.
 * Saves base64 strings as physical files.
 */
@Slf4j
@Service
public class FileStorageService {

    private final String uploadDir = "uploads/images";

    public FileStorageService() {
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            log.error("Could not create upload directory: {}", uploadDir, e);
        }
    }

    /**
     * Saves a base64 image string to a file and returns the relative path.
     *
     * @param base64Image the base64 encoded image string
     * @param prefix      a prefix for the filename (e.g., "identite", "cni")
     * @return a Mono containing the relative path to the saved file, or empty if it
     *         fails
     */
    public Mono<String> saveBase64Image(String base64Image, String prefix) {
        if (base64Image == null || base64Image.isEmpty() || !base64Image.contains(",")) {
            return Mono.empty();
        }

        return Mono.fromCallable(() -> {
            try {
                String[] parts = base64Image.split(",");
                String imageString = parts[1];
                String metadata = parts[0];
                String extension = metadata.contains("png") ? ".png" : ".jpg";

                byte[] imageBytes = Base64.getDecoder().decode(imageString);

                String fileName = prefix + "_" + UUID.randomUUID().toString() + extension;
                Path filePath = Paths.get(uploadDir, fileName);

                Files.write(filePath, imageBytes);
                log.info("Saved file to: {}", filePath);

                return filePath.toString();
            } catch (Exception e) {
                log.error("Error saving image", e);
                throw new RuntimeException("Could not save image", e);
            }
        });
    }
}
