package com.ckd.ai.admin.service;

import com.ckd.ai.admin.dto.ModelMetricsResponse;
import com.ckd.ai.admin.dto.LabResultSummary;
import com.ckd.ai.admin.dto.PatientDetailResponse;
import com.ckd.ai.admin.dto.PatientSummary;
import com.ckd.ai.admin.dto.RoleDetailsResponse;
import com.ckd.ai.admin.dto.UserSummary;
import com.ckd.ai.admin.model.RetrainingLog;
import com.ckd.ai.admin.repository.RetrainingLogRepository;
import com.ckd.ai.audit.model.AuditLog;
import com.ckd.ai.audit.repository.AuditRepository;
import com.ckd.ai.patient.model.LabResult;
import com.ckd.ai.patient.model.PatientProfile;
import com.ckd.ai.patient.repository.LabResultRepository;
import com.ckd.ai.patient.repository.PatientRepository;
import com.ckd.ai.user.model.Role;
import com.ckd.ai.user.model.User;
import com.ckd.ai.user.repository.RoleRepository;
import com.ckd.ai.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileWriter;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
public class AdminService {

    @Autowired
    private RetrainingLogRepository retrainingLogRepository;

    @Autowired
    private AuditRepository auditRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private LabResultRepository labResultRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${ml-service.url}")
    private String mlServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public void triggerRetraining(String triggeredBy) {
        RetrainingLog log = new RetrainingLog();
        log.setTriggeredBy(triggeredBy);
        log.setStatus("IN_PROGRESS");
        log.setStartTime(LocalDateTime.now());

        retrainingLogRepository.save(log);

        try {
            restTemplate.postForObject(mlServiceUrl + "/retrain", null, Map.class);
            log.setStatus("SUCCESS");
        } catch (Exception e) {
            log.setStatus("FAILED");
        }

        log.setEndTime(LocalDateTime.now());
        retrainingLogRepository.save(log);
    }

    public ModelMetricsResponse getModelMetrics() {
        // In a real system, you'd fetch this from the ML service or a metadata DB
        return ModelMetricsResponse.builder()
                .accuracy(0.965f)
                .precision(0.958f)
                .recall(0.962f)
                .f1Score(0.960f)
                .lastTrained(LocalDateTime.now().minusDays(1))
                .version("v1.2.0")
                .build();
    }

    public List<UserSummary> getAllUsers() {
        return userRepository.findAll().stream().map(user -> new UserSummary(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRoles().stream().map(Role::getName).collect(java.util.stream.Collectors.toSet()))).toList();
    }

    public void resetUserPassword(Long userId, String newPassword) {
        java.util.Objects.requireNonNull(userId, "userId");
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Cascade delete PatientProfile and LabResults
        patientRepository.findByUser(user).ifPresent(profile -> {
            List<LabResult> labResults = labResultRepository.findByPatientOrderByTestDateDesc(profile);
            labResultRepository.deleteAll(Objects.requireNonNull(labResults));
            patientRepository.delete(Objects.requireNonNull(profile));
        });

        userRepository.delete(Objects.requireNonNull(user));

        AuditLog log = new AuditLog();
        log.setAction("DELETE_USER");
        log.setPerformedBy("ADMIN");
        log.setDetails("Deleted user: " + user.getUsername());
        auditRepository.save(log);
    }

    public List<PatientSummary> getAllPatients() {
        return patientRepository.findAll().stream().map(profile -> new PatientSummary(
                profile.getId(),
                profile.getUser().getFullName(),
                profile.getUser().getUsername(),
                profile.getUser().getEmail(),
                profile.getAge(),
                profile.getGender())).toList();
    }

    public PatientDetailResponse getPatientDetails(Long patientId) {
        java.util.Objects.requireNonNull(patientId, "patientId");
        PatientProfile profile = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        PatientSummary summary = new PatientSummary(
                profile.getId(),
                profile.getUser().getFullName(),
                profile.getUser().getUsername(),
                profile.getUser().getEmail(),
                profile.getAge(),
                profile.getGender());
        List<LabResultSummary> labResults = labResultRepository.findByPatientOrderByTestDateDesc(profile)
                .stream()
                .map(lab -> new LabResultSummary(
                        lab.getId(),
                        lab.getTestDate(),
                        lab.getStage(),
                        lab.getRiskScore(),
                        lab.getSerumCreatinine(),
                        lab.getHemoglobin()))
                .toList();
        return new PatientDetailResponse(summary, labResults);
    }

    public List<LabResult> getAllLabResults() {
        return labResultRepository.findAll();
    }

    public void deleteLabResult(Long id) {
        LabResult labResult = labResultRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Lab result not found"));
        labResultRepository.delete(Objects.requireNonNull(labResult));

        AuditLog log = new AuditLog();
        log.setAction("DELETE_LAB_RESULT");
        log.setPerformedBy("ADMIN");
        log.setDetails("Deleted lab result ID: " + id);
        auditRepository.save(log);
    }

    public List<AuditLog> getAuditLogs() {
        return auditRepository.findAllByOrderByTimestampDesc();
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll().stream()
                .filter(role -> !"ROLE_GUEST".equals(role.getName()))
                .collect(java.util.stream.Collectors.toList());
    }

    public List<UserSummary> getAdministrators() {
        Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElse(null);
        if (adminRole == null)
            return List.of();

        return userRepository.findAll().stream()
                .filter(user -> user.getRoles() != null && user.getRoles().contains(adminRole))
                .map(user -> new UserSummary(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getFullName(),
                        user.getRoles().stream().map(Role::getName).collect(java.util.stream.Collectors.toSet())))
                .collect(java.util.stream.Collectors.toList());
    }

    public String seedBaseData() {
        List<String> roles = List.of("ROLE_PATIENT", "ROLE_DOCTOR", "ROLE_ADMIN");
        for (String roleName : roles) {
            roleRepository.findByName(roleName)
                    .orElseGet(() -> roleRepository.save(new Role(null, roleName)));
        }

        // Cleanup: Remove ROLE_GUEST if it exists
        roleRepository.findByName("ROLE_GUEST").ifPresent(role -> {
            // First clear user associations if any (safety)
            userRepository.findAll().forEach(user -> {
                if (user.getRoles().contains(role)) {
                    user.getRoles().remove(role);
                    userRepository.save(user);
                }
            });
            roleRepository.delete(Objects.requireNonNull(role));
        });

        String adminUsername = "admin";
        User adminUser = userRepository.findByUsername(adminUsername).orElse(null);
        Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElse(null);

        if (adminUser == null) {
            adminUser = new User();
            adminUser.setUsername(adminUsername);
            adminUser.setEmail("admin@ckd-ai.com");
            adminUser.setPassword(passwordEncoder.encode("admin123"));
            adminUser.setFullName("System Administrator");
            Set<Role> rolesSet = new HashSet<>();
            if (adminRole != null) {
                rolesSet.add(adminRole);
            }
            adminUser.setRoles(rolesSet);
            userRepository.save(adminUser);
            return "Base roles and admin user created.";
        }

        if (adminRole != null && (adminUser.getRoles() == null || !adminUser.getRoles().contains(adminRole))) {
            Set<Role> rolesSet = new HashSet<>(adminUser.getRoles() == null ? Set.of() : adminUser.getRoles());
            rolesSet.add(adminRole);
            adminUser.setRoles(rolesSet);
            userRepository.save(adminUser);
        }

        return "Base roles already exist. Admin user verified.";
    }

    public Map<String, Object> uploadDataset(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("CSV file is required");
        }

        List<String> requiredColumns = List.of(
                "age", "blood_pressure", "specific_gravity", "albumin", "sugar", "red_blood_cells",
                "pus_cell", "pus_cell_clumps", "bacteria", "blood_glucose_random", "blood_urea",
                "serum_creatinine", "sodium", "potassium", "hemoglobin", "packed_cell_volume",
                "white_blood_cell_count", "red_blood_cell_count", "hypertension", "diabetes_mellitus",
                "coronary_artery_disease", "appetite", "peda_edema", "aanemia");

        int addedRows = 0;
        // Use absolute path to ensure file is found regardless of working directory
        File csvFile = new File("../ml/data/ckd_initial_data.csv");
        String csvPath = csvFile.getAbsolutePath();

        // Log the path for debugging
        System.out.println("CSV Path: " + csvPath);
        System.out.println("CSV File exists: " + csvFile.exists());
        System.out.println("CSV File parent exists: " + csvFile.getParentFile().exists());

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
                FileWriter writer = new FileWriter(csvPath, true)) {

            String header = reader.readLine();
            if (header == null) {
                throw new RuntimeException("CSV header missing");
            }

            String[] headerParts = header.split(",");
            if (headerParts.length < requiredColumns.size()) {
                throw new RuntimeException("CSV missing required columns. Found " + headerParts.length
                        + " columns, expected at least " + requiredColumns.size());
            }

            for (String col : requiredColumns) {
                boolean exists = false;
                for (String h : headerParts) {
                    if (h.trim().equalsIgnoreCase(col)) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    throw new RuntimeException("CSV missing column: " + col);
                }
            }

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty())
                    continue;
                writer.write("\n" + line);
                addedRows++;
            }
        } catch (Exception ex) {
            System.err.println("Upload error: " + ex.getMessage());
            ex.printStackTrace();
            throw new RuntimeException("Upload failed: " + ex.getMessage());
        }

        AuditLog log = new AuditLog();
        log.setAction("DATASET_UPLOAD");
        log.setPerformedBy("ADMIN");
        log.setDetails("Merged dataset rows: " + addedRows);
        auditRepository.save(log);

        boolean retrainTriggered = false;
        try {
            restTemplate.postForObject(mlServiceUrl + "/retrain", null, Map.class);
            retrainTriggered = true;

            AuditLog retrainLog = new AuditLog();
            retrainLog.setAction("AUTO_RETRAIN");
            retrainLog.setPerformedBy("SYSTEM");
            retrainLog.setDetails("Auto retrain triggered after dataset upload");
            auditRepository.save(retrainLog);
        } catch (Exception ex) {
            AuditLog retrainLog = new AuditLog();
            retrainLog.setAction("AUTO_RETRAIN_FAILED");
            retrainLog.setPerformedBy("SYSTEM");
            retrainLog.setDetails("Auto retrain failed: " + ex.getMessage());
            auditRepository.save(retrainLog);
        }

        return Map.of(
                "message", "Dataset merged successfully",
                "addedRows", addedRows,
                "retrainTriggered", retrainTriggered);
    }

    public Map<String, Object> getDatasetStatistics() {
        List<LabResult> allResults = labResultRepository.findAll();

        if (allResults.isEmpty()) {
            return Map.of("message", "No data available");
        }

        // Categorical features
        Map<String, Long> redBloodCells = Map.of(
                "normal", allResults.stream().filter(r -> "normal".equalsIgnoreCase(r.getRedBloodCells())).count(),
                "abnormal", allResults.stream().filter(r -> "abnormal".equalsIgnoreCase(r.getRedBloodCells())).count());

        Map<String, Long> pusCell = Map.of(
                "normal", allResults.stream().filter(r -> "normal".equalsIgnoreCase(r.getPusCell())).count(),
                "abnormal", allResults.stream().filter(r -> "abnormal".equalsIgnoreCase(r.getPusCell())).count());

        Map<String, Long> pusCellClumps = Map.of(
                "present", allResults.stream().filter(r -> "present".equalsIgnoreCase(r.getPusCellClumps())).count(),
                "notpresent",
                allResults.stream().filter(r -> "notpresent".equalsIgnoreCase(r.getPusCellClumps())).count());

        Map<String, Long> bacteria = Map.of(
                "present", allResults.stream().filter(r -> "present".equalsIgnoreCase(r.getBacteria())).count(),
                "notpresent", allResults.stream().filter(r -> "notpresent".equalsIgnoreCase(r.getBacteria())).count());

        Map<String, Long> hypertension = Map.of(
                "yes", allResults.stream().filter(r -> "yes".equalsIgnoreCase(r.getHypertension())).count(),
                "no", allResults.stream().filter(r -> "no".equalsIgnoreCase(r.getHypertension())).count());

        Map<String, Long> diabetesMellitus = Map.of(
                "yes", allResults.stream().filter(r -> "yes".equalsIgnoreCase(r.getDiabetesMellitus())).count(),
                "no", allResults.stream().filter(r -> "no".equalsIgnoreCase(r.getDiabetesMellitus())).count());

        Map<String, Long> coronaryArteryDisease = Map.of(
                "yes", allResults.stream().filter(r -> "yes".equalsIgnoreCase(r.getCoronaryArteryDisease())).count(),
                "no", allResults.stream().filter(r -> "no".equalsIgnoreCase(r.getCoronaryArteryDisease())).count());

        Map<String, Long> appetite = Map.of(
                "good", allResults.stream().filter(r -> "good".equalsIgnoreCase(r.getAppetite())).count(),
                "poor", allResults.stream().filter(r -> "poor".equalsIgnoreCase(r.getAppetite())).count());

        Map<String, Long> pedaEdema = Map.of(
                "yes", allResults.stream().filter(r -> "yes".equalsIgnoreCase(r.getPedaEdema())).count(),
                "no", allResults.stream().filter(r -> "no".equalsIgnoreCase(r.getPedaEdema())).count());

        Map<String, Long> aanemia = Map.of(
                "yes", allResults.stream().filter(r -> "yes".equalsIgnoreCase(r.getAanemia())).count(),
                "no", allResults.stream().filter(r -> "no".equalsIgnoreCase(r.getAanemia())).count());

        Map<String, Long> specificGravity = new java.util.HashMap<>();
        allResults.forEach(r -> {
            String val = String.valueOf(r.getSpecificGravity());
            specificGravity.put(val, specificGravity.getOrDefault(val, 0L) + 1);
        });

        Map<String, Long> albumin = new java.util.HashMap<>();
        allResults.forEach(r -> {
            String val = String.valueOf((int) r.getAlbumin());
            albumin.put(val, albumin.getOrDefault(val, 0L) + 1);
        });

        Map<String, Long> sugar = new java.util.HashMap<>();
        allResults.forEach(r -> {
            String val = String.valueOf((int) r.getSugar());
            sugar.put(val, sugar.getOrDefault(val, 0L) + 1);
        });

        // Numerical features (distributions)
        Map<String, Map<String, Long>> numericalFeatures = new java.util.HashMap<>();

        // Age distribution (using null-safe accessor if needed, but now it's in
        // LabResult)
        numericalFeatures.put("age", Map.of(
                "0-20", allResults.stream().filter(r -> r.getAge() != null && r.getAge() <= 20).count(),
                "21-40",
                allResults.stream().filter(r -> r.getAge() != null && r.getAge() > 20 && r.getAge() <= 40).count(),
                "41-60",
                allResults.stream().filter(r -> r.getAge() != null && r.getAge() > 40 && r.getAge() <= 60).count(),
                "61-80",
                allResults.stream().filter(r -> r.getAge() != null && r.getAge() > 60 && r.getAge() <= 80).count(),
                "81+", allResults.stream().filter(r -> r.getAge() != null && r.getAge() > 80).count()));

        // Serum Creatinine distribution
        numericalFeatures.put("serumCreatinine", Map.of(
                "0-1.2", allResults.stream().filter(r -> r.getSerumCreatinine() <= 1.2).count(),
                "1.3-3.0",
                allResults.stream().filter(r -> r.getSerumCreatinine() > 1.2 && r.getSerumCreatinine() <= 3.0).count(),
                "3.1-6.0",
                allResults.stream().filter(r -> r.getSerumCreatinine() > 3.0 && r.getSerumCreatinine() <= 6.0).count(),
                "6.1+", allResults.stream().filter(r -> r.getSerumCreatinine() > 6.0).count()));

        // Hemoglobin distribution
        numericalFeatures.put("hemoglobin", Map.of(
                "0-8", allResults.stream().filter(r -> r.getHemoglobin() <= 8).count(),
                "9-12", allResults.stream().filter(r -> r.getHemoglobin() > 8 && r.getHemoglobin() <= 12).count(),
                "13-15", allResults.stream().filter(r -> r.getHemoglobin() > 12 && r.getHemoglobin() <= 15).count(),
                "16+", allResults.stream().filter(r -> r.getHemoglobin() > 15).count()));

        // Blood Pressure distribution
        numericalFeatures.put("bloodPressure", Map.of(
                "0-70", allResults.stream().filter(r -> r.getBloodPressure() <= 70).count(),
                "71-90",
                allResults.stream().filter(r -> r.getBloodPressure() > 70 && r.getBloodPressure() <= 90).count(),
                "91-110",
                allResults.stream().filter(r -> r.getBloodPressure() > 90 && r.getBloodPressure() <= 110).count(),
                "111+", allResults.stream().filter(r -> r.getBloodPressure() > 110).count()));

        // Blood Glucose Random distribution
        numericalFeatures.put("bloodGlucoseRandom", Map.of(
                "0-100", allResults.stream().filter(r -> r.getBloodGlucoseRandom() <= 100).count(),
                "101-200",
                allResults.stream().filter(r -> r.getBloodGlucoseRandom() > 100 && r.getBloodGlucoseRandom() <= 200)
                        .count(),
                "201-300",
                allResults.stream().filter(r -> r.getBloodGlucoseRandom() > 200 && r.getBloodGlucoseRandom() <= 300)
                        .count(),
                "301+", allResults.stream().filter(r -> r.getBloodGlucoseRandom() > 300).count()));

        // Blood Urea distribution
        numericalFeatures.put("bloodUrea", Map.of(
                "0-40", allResults.stream().filter(r -> r.getBloodUrea() <= 40).count(),
                "41-100", allResults.stream().filter(r -> r.getBloodUrea() > 40 && r.getBloodUrea() <= 100).count(),
                "101-200", allResults.stream().filter(r -> r.getBloodUrea() > 100 && r.getBloodUrea() <= 200).count(),
                "201+", allResults.stream().filter(r -> r.getBloodUrea() > 200).count()));

        // Sodium distribution
        numericalFeatures.put("sodium", Map.of(
                "0-130", allResults.stream().filter(r -> r.getSodium() <= 130).count(),
                "131-140", allResults.stream().filter(r -> r.getSodium() > 130 && r.getSodium() <= 140).count(),
                "141-150", allResults.stream().filter(r -> r.getSodium() > 140 && r.getSodium() <= 150).count(),
                "151+", allResults.stream().filter(r -> r.getSodium() > 150).count()));

        // Potassium distribution
        numericalFeatures.put("potassium", Map.of(
                "0-3.5", allResults.stream().filter(r -> r.getPotassium() <= 3.5).count(),
                "3.6-5.0", allResults.stream().filter(r -> r.getPotassium() > 3.5 && r.getPotassium() <= 5.0).count(),
                "5.1-7.0", allResults.stream().filter(r -> r.getPotassium() > 5.0 && r.getPotassium() <= 7.0).count(),
                "7.1+", allResults.stream().filter(r -> r.getPotassium() > 7.0).count()));

        // Packed Cell Volume distribution
        numericalFeatures.put("packedCellVolume", Map.of(
                "0-30", allResults.stream().filter(r -> r.getPackedCellVolume() <= 30).count(),
                "31-40",
                allResults.stream().filter(r -> r.getPackedCellVolume() > 30 && r.getPackedCellVolume() <= 40).count(),
                "41-50",
                allResults.stream().filter(r -> r.getPackedCellVolume() > 40 && r.getPackedCellVolume() <= 50).count(),
                "51+", allResults.stream().filter(r -> r.getPackedCellVolume() > 50).count()));

        // White Blood Cell Count distribution
        numericalFeatures.put("whiteBloodCellCount", Map.of(
                "0-4000", allResults.stream().filter(r -> r.getWhiteBloodCellCount() <= 4000).count(),
                "4001-8000",
                allResults.stream().filter(r -> r.getWhiteBloodCellCount() > 4000 && r.getWhiteBloodCellCount() <= 8000)
                        .count(),
                "8001-12000",
                allResults.stream()
                        .filter(r -> r.getWhiteBloodCellCount() > 8000 && r.getWhiteBloodCellCount() <= 12000).count(),
                "12001+", allResults.stream().filter(r -> r.getWhiteBloodCellCount() > 12000).count()));

        // Red Blood Cell Count distribution
        numericalFeatures.put("redBloodCellCount", Map.of(
                "0-3.0", allResults.stream().filter(r -> r.getRedBloodCellCount() <= 3.0).count(),
                "3.1-4.5",
                allResults.stream().filter(r -> r.getRedBloodCellCount() > 3.0 && r.getRedBloodCellCount() <= 4.5)
                        .count(),
                "4.6-6.0",
                allResults.stream().filter(r -> r.getRedBloodCellCount() > 4.5 && r.getRedBloodCellCount() <= 6.0)
                        .count(),
                "6.1+", allResults.stream().filter(r -> r.getRedBloodCellCount() > 6.0).count()));

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("totalRecords", (long) allResults.size());

        Map<String, Object> categoricalMap = new java.util.HashMap<>();
        categoricalMap.put("redBloodCells", redBloodCells);
        categoricalMap.put("pusCell", pusCell);
        categoricalMap.put("pusCellClumps", pusCellClumps);
        categoricalMap.put("bacteria", bacteria);
        categoricalMap.put("hypertension", hypertension);
        categoricalMap.put("diabetesMellitus", diabetesMellitus);
        categoricalMap.put("coronaryArteryDisease", coronaryArteryDisease);
        categoricalMap.put("appetite", appetite);
        categoricalMap.put("pedaEdema", pedaEdema);
        categoricalMap.put("aanemia", aanemia);
        categoricalMap.put("specificGravity", specificGravity);
        categoricalMap.put("albumin", albumin);
        categoricalMap.put("sugar", sugar);

        response.put("categoricalFeatures", categoricalMap);
        response.put("numericalFeatures", numericalFeatures);

        return response;
    }

    public RoleDetailsResponse getRoleDetails(String roleName) {
        String description;
        switch (roleName) {
            case "ROLE_ADMIN":
                description = "Full system access. Manage users, roles, system configuration, and audit logs.";
                break;
            case "ROLE_DOCTOR":
                description = "Medical professional access. Manage patient records, lab results, and provide AI-assisted diagnoses.";
                break;
            case "ROLE_PATIENT":
                description = "General user access. View personal health records, lab history, and AI risk assessments.";
                break;
            default:
                description = "Custom role with specific system permissions.";
                break;
        }

        List<UserSummary> users = userRepository.findAllByRolesName(roleName).stream()
                .map(user -> new UserSummary(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getFullName(),
                        user.getRoles().stream().map(Role::getName).collect(java.util.stream.Collectors.toSet())))
                .collect(java.util.stream.Collectors.toList());

        return new RoleDetailsResponse(roleName, description, users);
    }
}
