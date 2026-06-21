package com.ckd.ai.config;

import com.ckd.ai.patient.model.LabResult;
import com.ckd.ai.patient.model.PatientProfile;
import com.ckd.ai.patient.repository.LabResultRepository;
import com.ckd.ai.patient.repository.PatientRepository;
import com.ckd.ai.user.model.Role;
import com.ckd.ai.user.model.User;
import com.ckd.ai.user.repository.RoleRepository;
import com.ckd.ai.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.FileReader;
import java.util.Collections;
import java.util.Objects;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private LabResultRepository labResultRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Initial Data Import from Training CSV
        ensureRoles();
        ensureAdminUser();
        ensureDoctorUser();
        ensureDemoUser();
        ensureTestPatients(); // Always ensure at least a few test patients exist
        if (patientRepository.count() == 0) {
            System.out.println("Starting Initial Data Import from CSV to Database...");
            importInitialData();
            System.out.println("Data Import Completed Successfully.");
        }
    }

    private void ensureRoles() {
        String[] roles = { "ROLE_PATIENT", "ROLE_DOCTOR", "ROLE_ADMIN" };
        for (String roleName : roles) {
            roleRepository.findByName(roleName)
                    .orElseGet(() -> roleRepository.save(new Role(null, roleName)));
        }

        // Proactive cleanup: remove ROLE_GUEST if it still exists from previous
        // versions
        roleRepository.findByName("ROLE_GUEST").ifPresent(role -> {
            userRepository.findAll().forEach(user -> {
                if (user.getRoles().contains(role)) {
                    user.getRoles().remove(role);
                    userRepository.save(user);
                }
            });
            roleRepository.delete(Objects.requireNonNull(role));
            System.out.println("Cleaned up legacy ROLE_GUEST from database.");
        });
    }

    private void ensureAdminUser() {
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(new Role(null, "ROLE_ADMIN")));
        User adminUser = userRepository.findByUsername("admin").orElse(null);

        if (adminUser == null) {
            adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setEmail("admin@ckd-ai.com");
            adminUser.setFullName("System Administrator");
        }

        adminUser.setPassword(passwordEncoder.encode("admin123"));
        adminUser.setRoles(Collections.singleton(adminRole));
        userRepository.save(adminUser);
        System.out.println("Admin user initialized successfully: admin/admin123");
    }

    private void ensureDoctorUser() {
        Role doctorRole = roleRepository.findByName("ROLE_DOCTOR")
                .orElseGet(() -> roleRepository.save(new Role(null, "ROLE_DOCTOR")));
        User doctor = userRepository.findByUsername("doctor").orElse(null);

        if (doctor == null) {
            doctor = new User();
            doctor.setUsername("doctor");
            doctor.setEmail("doctor@ckd-ai.com");
            doctor.setFullName("Demo Doctor");
        }

        doctor.setPassword(passwordEncoder.encode("doctor123"));
        doctor.setRoles(Collections.singleton(doctorRole));
        userRepository.save(doctor);
    }

    private void ensureDemoUser() {
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(new Role(null, "ROLE_ADMIN")));
        User demo = userRepository.findByUsername("demo").orElse(null);

        if (demo == null) {
            demo = new User();
            demo.setUsername("demo");
            demo.setEmail("demo@ckd-ai.com");
            demo.setFullName("Demo Administrator");
        }

        demo.setPassword(passwordEncoder.encode("demo123"));
        demo.setRoles(Collections.singleton(adminRole));
        userRepository.save(demo);
        System.out.println("Demo user initialized successfully: demo/demo123");
    }

    private void ensureTestPatients() {
        Role patientRole = roleRepository.findByName("ROLE_PATIENT")
                .orElseGet(() -> roleRepository.save(new Role(null, "ROLE_PATIENT")));

        // Ensure at least 3 test patients exist for messaging
        String[] testPatients = {
                "test_patient_1", "Test Patient 1", "test1@example.com",
                "test_patient_2", "Test Patient 2", "test2@example.com",
                "test_patient_3", "Test Patient 3", "test3@example.com"
        };

        for (int i = 0; i < testPatients.length; i += 3) {
            String username = testPatients[i];
            String fullName = testPatients[i + 1];
            String email = testPatients[i + 2];

            User patient = userRepository.findByUsername(username).orElse(null);
            if (patient == null) {
                patient = new User();
                patient.setUsername(username);
                patient.setEmail(email);
                patient.setFullName(fullName);
                patient.setPassword(passwordEncoder.encode("password123"));
                patient.setRoles(Collections.singleton(patientRole));
                userRepository.save(patient);
                System.out.println("Created test patient: " + username);
            }

            // Ensure PatientProfile exists for this user
            if (patientRepository.findByUser(patient).isEmpty()) {
                PatientProfile profile = new PatientProfile();
                profile.setUser(patient);
                profile.setAge(35);
                profile.setGender("Male");
                profile.setBloodGroup("O+");
                profile.setContactNumber("+91 9876543210");
                profile.setAddress("Sample Address");
                patientRepository.save(profile);
                System.out.println("Created PatientProfile for: " + username);
            }
        }
    }

    private void importInitialData() {
        String csvFile = new java.io.File("../ml/data/ckd_initial_data.csv").getAbsolutePath();
        String line;
        String cvsSplitBy = ",";

        try (BufferedReader br = new BufferedReader(new FileReader(csvFile))) {
            // Skip header
            br.readLine();

            int count = 0;
            while ((line = br.readLine()) != null && count < 100) { // Import first 100 records for demo
                String[] data = line.split(cvsSplitBy);

                // Create a dummy user for each record
                String username = "patient_" + count;
                if (!userRepository.existsByUsername(username)) {
                    User user = new User();
                    user.setUsername(username);
                    user.setEmail(username + "@example.com");
                    user.setPassword(passwordEncoder.encode("password123"));
                    user.setFullName("Sample Patient " + count);

                    Optional<Role> role = roleRepository.findByName("ROLE_PATIENT");
                    role.ifPresent(value -> user.setRoles(Collections.singleton(value)));
                    userRepository.save(user);

                    PatientProfile profile = new PatientProfile();
                    profile.setUser(user);
                    profile.setAge(Integer.parseInt(data[0]));
                    profile.setGender(count % 2 == 0 ? "Male" : "Female");
                    patientRepository.save(profile);

                    LabResult lr = new LabResult();
                    lr.setPatient(profile);
                    lr.setBloodPressure(Float.parseFloat(data[1]));
                    lr.setSpecificGravity(Float.parseFloat(data[2]));
                    lr.setAlbumin(Float.parseFloat(data[3]));
                    lr.setSugar(Float.parseFloat(data[4]));
                    lr.setRedBloodCells(data[5]);
                    lr.setPusCell(data[6]);
                    lr.setPusCellClumps(data[7]);
                    lr.setBacteria(data[8]);
                    lr.setBloodGlucoseRandom(Float.parseFloat(data[9]));
                    lr.setBloodUrea(Float.parseFloat(data[10]));
                    lr.setSerumCreatinine(Float.parseFloat(data[11]));
                    lr.setSodium(Float.parseFloat(data[12]));
                    lr.setPotassium(Float.parseFloat(data[13]));
                    lr.setHemoglobin(Float.parseFloat(data[14]));
                    lr.setPackedCellVolume(Float.parseFloat(data[15]));
                    lr.setWhiteBloodCellCount(Float.parseFloat(data[16]));
                    lr.setRedBloodCellCount(Float.parseFloat(data[17]));
                    lr.setHypertension(data[18]);
                    lr.setDiabetesMellitus(data[19]);
                    lr.setCoronaryArteryDisease(data[20]);
                    lr.setAppetite(data[21]);
                    lr.setPedaEdema(data[22]);
                    lr.setAanemia(data[23]);
                    lr.setStage(Integer.parseInt(data[25]));
                    lr.setCkdDetected(data[26]);
                    lr.setRiskScore(Float.parseFloat(data[27]));
                    lr.setConfidence(95.0f);
                    labResultRepository.save(lr);
                }
                count++;
            }
        } catch (Exception e) {
            System.err.println("Error importing CSV: " + e.getMessage());
        }
    }
}
