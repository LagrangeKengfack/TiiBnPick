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
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Runs the Python OSM address loader script at backend startup
 * if fewer than 50 addresses are present in the database.
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

    private static final long ADDRESS_THRESHOLD = 50;
    private final AddressRepository addressRepository;

    @Override
    public void run(ApplicationArguments args) {
        try {
            Long count = addressRepository.count().block();
            log.info("[AddressSeeder] Current address count in DB: {}", count);

            if (count != null && count >= ADDRESS_THRESHOLD) {
                log.info("[AddressSeeder] {} addresses found (>= {} threshold). OSM loading skipped.",
                        count, ADDRESS_THRESHOLD);
                return;
            }

            log.info("[AddressSeeder] Only {} addresses found (< {} threshold). Launching OSM loader...",
                    count, ADDRESS_THRESHOLD);
            runPythonScript();

        } catch (Exception e) {
            log.error("[AddressSeeder] Error during address seeding check:", e);
        }
    }

    private void runPythonScript() {
        try {
            // Resolve script path: try multiple locations
            File scriptFile = findScript();
            if (scriptFile == null) {
                log.warn("[AddressSeeder] load_osm_addresses.py not found in any expected location. Skipping.");
                return;
            }

            log.info("[AddressSeeder] Found script at: {}", scriptFile.getAbsolutePath());
            log.info("[AddressSeeder] Running: python3 {}", scriptFile.getAbsolutePath());

            ProcessBuilder pb = new ProcessBuilder("python3", scriptFile.getAbsolutePath());
            pb.directory(scriptFile.getParentFile());
            pb.redirectErrorStream(true);

            // Pass all environment variables (includes DB_HOST, DB_PORT, etc.)
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
                Long newCount = addressRepository.count().block();
                log.info("[AddressSeeder] OSM loader completed successfully. Address count now: {}", newCount);
            } else {
                log.error("[AddressSeeder] OSM loader exited with code: {}", exitCode);
            }

        } catch (Exception e) {
            log.error("[AddressSeeder] Failed to run OSM address loader script:", e);
        }
    }

    /**
     * Searches for load_osm_addresses.py in multiple locations:
     * 1. Current working directory
     * 2. Project root (user.dir)
     * 3. Relative to the compiled classes directory
     */
    private File findScript() {
        String scriptName = "load_osm_addresses.py";
        String[] searchPaths = {
                System.getProperty("user.dir"),
                System.getProperty("user.dir") + "/../../..",  // From target/classes back to root
                Paths.get("").toAbsolutePath().toString(),
        };

        log.info("[AddressSeeder] Searching for {} in:", scriptName);
        for (String basePath : searchPaths) {
            if (basePath == null) continue;
            File candidate = new File(basePath, scriptName);
            log.info("[AddressSeeder]   Checking: {} -> exists={}", candidate.getAbsolutePath(), candidate.exists());
            if (candidate.exists()) {
                return candidate;
            }
        }
        return null;
    }
}
