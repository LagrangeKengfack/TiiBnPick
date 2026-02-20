package com.polytechnique.tiibntick.config;

import com.polytechnique.tiibntick.repositories.AddressRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.ApplicationArguments;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;

/**
 * Runs the Python OSM address loader script at backend startup
 * if no addresses are present in the database.
 *
 * <p>The script {@code load_osm_addresses.py} fetches real addresses from
 * the Overpass API (OpenStreetMap) for Yaoundé and Douala, then inserts
 * them directly into the addresses table via psycopg2.
 *
 * @author TiiBnTick Team
 */
@Slf4j
@Component
@RequiredArgsConstructor
@Order(2)
public class AddressDataSeeder implements ApplicationRunner {

    private final AddressRepository addressRepository;

    @Override
    public void run(ApplicationArguments args) {
        addressRepository.count().subscribe(count -> {
            if (count > 0) {
                log.info("Found {} addresses in database, skipping OSM address loading.", count);
                return;
            }

            log.info("No addresses found in database. Launching OSM address loader script...");
            new Thread(() -> runPythonScript(), "osm-address-loader").start();
        }, error -> log.error("Error checking address count:", error));
    }

    private void runPythonScript() {
        try {
            // Look for the script in the project root directory
            File scriptFile = new File("load_osm_addresses.py");
            if (!scriptFile.exists()) {
                log.warn("load_osm_addresses.py not found at: {}. Skipping address seeding.",
                        scriptFile.getAbsolutePath());
                return;
            }

            log.info("Running: python3 {}", scriptFile.getAbsolutePath());

            ProcessBuilder pb = new ProcessBuilder("python3", scriptFile.getAbsolutePath());
            pb.directory(scriptFile.getParentFile());
            pb.redirectErrorStream(true);

            // Pass DB environment variables to the subprocess
            pb.environment().putAll(System.getenv());

            Process process = pb.start();

            // Stream the script output to the application log
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    log.info("[OSM Loader] {}", line);
                }
            }

            int exitCode = process.waitFor();
            if (exitCode == 0) {
                log.info("OSM address loader completed successfully.");
            } else {
                log.error("OSM address loader exited with code: {}", exitCode);
            }

        } catch (Exception e) {
            log.error("Failed to run OSM address loader script:", e);
        }
    }
}
