package com.polytechnique.tiibntick.infrastructure.storage;

import com.polytechnique.tiibntick.domain.port.out.FileStoragePort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.UUID;

/**
 * Outbound adapter: implements the FileStoragePort using the local filesystem.
 */
@Slf4j
@Component
public class FileStorageAdapter implements FileStoragePort {

    private final String uploadDir = "uploads/images";

    public FileStorageAdapter() {
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            log.error("Could not create upload directory: {}", uploadDir, e);
        }
    }

    @Override
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
                String fileName = prefix + "_" + UUID.randomUUID() + extension;
                Path filePath = Paths.get(uploadDir, fileName);
                Files.write(filePath, imageBytes);
                log.info("Saved base64 file to: {}", filePath);
                return "/" + filePath;
            } catch (Exception e) {
                log.error("Error saving base64 image", e);
                throw new RuntimeException("Could not save image", e);
            }
        });
    }

    @Override
    public Mono<String> saveFilePart(FilePart filePart, String prefix) {
        if (filePart == null) {
            return Mono.empty();
        }

        String originalFilename = filePart.filename();
        String extension = originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                : ".jpg";

        String fileName = prefix + "_" + UUID.randomUUID() + extension;
        Path filePath = Paths.get(uploadDir, fileName);

        return filePart.transferTo(filePath)
                .then(Mono.fromCallable(() -> {
                    log.info("Saved multipart file to: {}", filePath);
                    return "/" + filePath;
                }));
    }

    @Override
    public Mono<Boolean> deleteFile(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return Mono.just(true);
        }

        return Mono.fromCallable(() -> {
            try {
                return Files.deleteIfExists(Paths.get(fileName));
            } catch (IOException e) {
                log.error("Error deleting file: {}", fileName, e);
                return false;
            }
        });
    }
}
