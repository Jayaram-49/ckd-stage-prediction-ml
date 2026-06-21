package com.ckd.ai.patient.service;

import com.ckd.ai.patient.model.LabResult;
import com.ckd.ai.patient.model.PatientProfile;
import com.ckd.ai.patient.repository.LabResultRepository;
import com.ckd.ai.patient.repository.PatientRepository;
import com.ckd.ai.user.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;

@Service
public class PatientService {

        @Autowired
        private PatientRepository patientRepository;

        @Autowired
        private LabResultRepository labResultRepository;

        @Value("${ml-service.url}")
        private String mlServiceUrl;

        private final RestTemplate restTemplate = new RestTemplate();

        public LabResult saveAndPredict(LabResult labResult, User user) {
                PatientProfile profile = patientRepository.findByUser(user)
                                .orElseThrow(() -> new RuntimeException("Patient profile not found"));

                labResult.setPatient(profile);

                // Call ML Service for prediction
                Map<String, Object> mlData = new HashMap<>();
                mlData.put("age", (float) profile.getAge());
                mlData.put("blood_pressure", labResult.getBloodPressure());
                mlData.put("specific_gravity", labResult.getSpecificGravity());
                mlData.put("albumin", labResult.getAlbumin());
                mlData.put("sugar", labResult.getSugar());
                mlData.put("red_blood_cells", labResult.getRedBloodCells());
                mlData.put("pus_cell", labResult.getPusCell());
                mlData.put("pus_cell_clumps", labResult.getPusCellClumps());
                mlData.put("bacteria", labResult.getBacteria());
                mlData.put("blood_glucose_random", labResult.getBloodGlucoseRandom());
                mlData.put("blood_urea", labResult.getBloodUrea());
                mlData.put("serum_creatinine", labResult.getSerumCreatinine());
                mlData.put("sodium", labResult.getSodium());
                mlData.put("potassium", labResult.getPotassium());
                mlData.put("hemoglobin", labResult.getHemoglobin());
                mlData.put("packed_cell_volume", labResult.getPackedCellVolume());
                mlData.put("white_blood_cell_count", labResult.getWhiteBloodCellCount());
                mlData.put("red_blood_cell_count", labResult.getRedBloodCellCount());
                mlData.put("hypertension", labResult.getHypertension());
                mlData.put("diabetes_mellitus", labResult.getDiabetesMellitus());
                mlData.put("coronary_artery_disease", labResult.getCoronaryArteryDisease());
                mlData.put("appetite", labResult.getAppetite());
                mlData.put("peda_edema", labResult.getPedaEdema());
                mlData.put("aanemia", labResult.getAanemia());

                @SuppressWarnings("unchecked")
                Map<String, Object> prediction = restTemplate.postForObject(mlServiceUrl + "/predict", mlData,
                                Map.class);

                if (prediction != null) {
                        labResult.setStage((Integer) prediction.get("stage"));
                        labResult.setRiskScore(((Number) prediction.get("risk_score")).floatValue());
                        labResult.setCkdDetected((String) prediction.get("ckd_detected"));
                        labResult.setConfidence(((Number) prediction.get("confidence")).floatValue());
                }

                LabResult saved = labResultRepository.save(labResult);

                // Logic for auto-training: In a real system, we'd append to CSV here or trigger
                // an update
                updateTrainingData(labResult);

                return saved;
        }

        private void updateTrainingData(LabResult lr) {
                // Implementation for appending new patient data to CSV for continuous learning
                try {
                        java.io.FileWriter fw = new java.io.FileWriter("ml/data/ckd_initial_data.csv", true);
                        StringBuilder sb = new StringBuilder();
                        sb.append("\n"); // New line for CSV
                        // Map lab result fields to CSV format
                        sb.append(lr.getPatient().getAge()).append(",");
                        sb.append(lr.getBloodPressure()).append(",");
                        sb.append(lr.getSpecificGravity()).append(",");
                        sb.append(lr.getAlbumin()).append(",");
                        sb.append(lr.getSugar()).append(",");
                        sb.append(lr.getRedBloodCells()).append(",");
                        sb.append(lr.getPusCell()).append(",");
                        sb.append(lr.getPusCellClumps()).append(",");
                        sb.append(lr.getBacteria()).append(",");
                        sb.append(lr.getBloodGlucoseRandom()).append(",");
                        sb.append(lr.getBloodUrea()).append(",");
                        sb.append(lr.getSerumCreatinine()).append(",");
                        sb.append(lr.getSodium()).append(",");
                        sb.append(lr.getPotassium()).append(",");
                        sb.append(lr.getHemoglobin()).append(",");
                        sb.append(lr.getPackedCellVolume()).append(",");
                        sb.append(lr.getWhiteBloodCellCount()).append(",");
                        sb.append(lr.getRedBloodCellCount()).append(",");
                        sb.append(lr.getHypertension()).append(",");
                        sb.append(lr.getDiabetesMellitus()).append(",");
                        sb.append(lr.getCoronaryArteryDisease()).append(",");
                        sb.append(lr.getAppetite()).append(",");
                        sb.append(lr.getPedaEdema()).append(",");
                        sb.append(lr.getAanemia()).append(",");
                        // GFR calculation for training data logic
                        float gfr = (float) (175 * Math.pow(lr.getSerumCreatinine(), -1.154)
                                        * Math.pow(lr.getPatient().getAge(), -0.203));
                        sb.append(gfr).append(",");
                        sb.append(lr.getStage()).append(",");
                        sb.append(lr.getCkdDetected()).append(",");
                        sb.append(lr.getRiskScore());

                        fw.write(sb.toString());
                        fw.close();
                } catch (Exception e) {
                        e.printStackTrace();
                }
        }

        public List<LabResult> getPatientHistory(User user) {
                PatientProfile profile = patientRepository.findByUser(user)
                                .orElseThrow(() -> new RuntimeException("Patient profile not found"));
                return labResultRepository.findByPatientOrderByTestDateDesc(profile);
        }

        public void deleteLabResult(Long id, User user) {
                LabResult labResult = labResultRepository.findById(Objects.requireNonNull(id))
                                .orElseThrow(() -> new RuntimeException("Lab result not found"));

                PatientProfile profile = patientRepository.findByUser(user)
                                .orElseThrow(() -> new RuntimeException("Patient profile not found"));

                if (!labResult.getPatient().getId().equals(profile.getId())) {
                        throw new RuntimeException("Unauthorized access to delete lab result");
                }

                labResultRepository.delete(labResult);
        }

        public PatientProfile getPatientProfile(User user) {
                return patientRepository.findByUser(user)
                                .orElseGet(() -> {
                                        // Auto-create profile if it doesn't exist
                                        PatientProfile profile = new PatientProfile();
                                        profile.setUser(user);
                                        profile.setAge(0);
                                        profile.setGender("");
                                        profile.setBloodGroup("");
                                        profile.setContactNumber("");
                                        profile.setAddress("");
                                        return patientRepository.save(profile);
                                });
        }

        @SuppressWarnings("null")
        public PatientProfile updatePatientProfile(User user, Map<String, Object> updateData) {
                PatientProfile profile = getPatientProfile(user);

                // Update PatientProfile fields
                if (updateData.containsKey("age")) {
                        profile.setAge(Integer.parseInt(updateData.get("age").toString()));
                }
                if (updateData.containsKey("gender")) {
                        profile.setGender((String) updateData.get("gender"));
                }
                if (updateData.containsKey("bloodGroup")) {
                        profile.setBloodGroup((String) updateData.get("bloodGroup"));
                }
                if (updateData.containsKey("contactNumber")) {
                        profile.setContactNumber((String) updateData.get("contactNumber"));
                }
                if (updateData.containsKey("address")) {
                        profile.setAddress((String) updateData.get("address"));
                }

                // Note: User updates (fullName/email) are skipped for now to favor
                // profile-specific fields.
                // If needed, they can be implemented with a separate UserRepository injection.

                return patientRepository.save(profile);
        }

        public List<Map<String, Object>> getExplanations(Long labResultId, User user) {
                if (labResultId == null) {
                        throw new IllegalArgumentException("Lab result ID cannot be null");
                }
                LabResult labResult = labResultRepository.findById(labResultId)
                                .orElseThrow(() -> new RuntimeException("Lab result not found"));

                // Verify the lab result belongs to the user
                PatientProfile profile = patientRepository.findByUser(user)
                                .orElseThrow(() -> new RuntimeException("Patient profile not found"));

                if (!labResult.getPatient().getId().equals(profile.getId())) {
                        throw new RuntimeException("Unauthorized access to lab result");
                }

                return getExplanationsInternal(labResult);
        }

        public List<Map<String, Object>> getExplanationsInternal(LabResult labResult) {
                PatientProfile profile = labResult.getPatient();
                List<Map<String, Object>> contributions = new ArrayList<>();

                float total = 0;

                // Calculate contributions based on clinical significance
                float creatinineImpact = Math.min(40, (labResult.getSerumCreatinine() / 2.0f) * 10);
                float hemoglobinImpact = Math.min(30, (15.0f - labResult.getHemoglobin()) * 2);
                float bloodPressureImpact = Math.min(20, Math.abs(labResult.getBloodPressure() - 120) / 2);
                float ageImpact = Math.min(15, (profile.getAge() / 10.0f));
                float ureaImpact = Math.min(10, (labResult.getBloodUrea() / 10.0f));
                float diabetesImpact = "yes".equalsIgnoreCase(labResult.getDiabetesMellitus()) ? 15 : 0;
                float hypertensionImpact = "yes".equalsIgnoreCase(labResult.getHypertension()) ? 12 : 0;
                float othersImpact = 8;

                total = creatinineImpact + hemoglobinImpact + bloodPressureImpact + ageImpact +
                                ureaImpact + diabetesImpact + hypertensionImpact + othersImpact;

                // Normalize to percentages
                if (total > 0) {
                        contributions.add(createFeature("Serum Creatinine",
                                        (creatinineImpact / total) * 100, labResult.getSerumCreatinine()));
                        contributions.add(createFeature("Hemoglobin",
                                        (hemoglobinImpact / total) * 100, labResult.getHemoglobin()));
                        contributions.add(createFeature("Blood Pressure",
                                        (bloodPressureImpact / total) * 100, labResult.getBloodPressure()));
                        if (diabetesImpact > 0) {
                                contributions.add(createFeature("Diabetes Mellitus",
                                                (diabetesImpact / total) * 100, "Yes"));
                        }
                        if (hypertensionImpact > 0) {
                                contributions.add(createFeature("Hypertension",
                                                (hypertensionImpact / total) * 100, "Yes"));
                        }
                        contributions.add(createFeature("Age",
                                        (ageImpact / total) * 100, profile.getAge()));
                        contributions.add(createFeature("Blood Urea",
                                        (ureaImpact / total) * 100, labResult.getBloodUrea()));
                        contributions.add(createFeature("Other Factors",
                                        (othersImpact / total) * 100, ""));
                } else {
                        // Fallback if calculation fails
                        contributions.add(createFeature("Serum Creatinine", 35, labResult.getSerumCreatinine()));
                        contributions.add(createFeature("Hemoglobin", 25, labResult.getHemoglobin()));
                        contributions.add(createFeature("Blood Pressure", 15, labResult.getBloodPressure()));
                        contributions.add(createFeature("Age", 10, profile.getAge()));
                        contributions.add(createFeature("Other Factors", 15, ""));
                }

                // Sort by value descending
                contributions.sort((a, b) -> Float.compare(
                                ((Number) b.get("value")).floatValue(),
                                ((Number) a.get("value")).floatValue()));

                return contributions;
        }

        private Map<String, Object> createFeature(String name, float value, Object actualValue) {
                Map<String, Object> feature = new HashMap<>();
                feature.put("feature", name);
                feature.put("value", Math.round(value * 10) / 10.0); // Round to 1 decimal
                feature.put("actualValue", actualValue);
                return feature;
        }

        public byte[] generatePdfReport(Long labResultId, User user) throws IOException {
                if (labResultId == null) {
                        throw new IllegalArgumentException("Lab result ID cannot be null");
                }
                LabResult labResult = labResultRepository.findById(labResultId)
                                .orElseThrow(() -> new RuntimeException("Lab result not found"));

                PatientProfile profile = patientRepository.findByUser(user)
                                .orElseThrow(() -> new RuntimeException("Patient profile not found"));

                if (!labResult.getPatient().getId().equals(profile.getId())) {
                        throw new RuntimeException("Unauthorized access to lab result");
                }

                return generatePdfReportInternal(labResult, user);
        }

        public byte[] generatePdfReportInternal(LabResult labResult, User user) throws IOException {
                PatientProfile profile = labResult.getPatient();

                try (PDDocument document = new PDDocument()) {
                        PDPage page = new PDPage(PDRectangle.A4);
                        document.addPage(page);

                        try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {

                                // Initialize Fonts once
                                PDType1Font fontBold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                                PDType1Font fontRegular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

                                // Color Definitions
                                java.awt.Color darkBlue = new java.awt.Color(0, 51, 153);
                                java.awt.Color abnormalColor = new java.awt.Color(204, 0, 0); // Red
                                java.awt.Color normalColor = new java.awt.Color(0, 51, 153); // Blue

                                float margin = 40;
                                float yPosition = PDRectangle.A4.getHeight() - margin;
                                float pageWidth = PDRectangle.A4.getWidth();

                                // 1. HEADER (Official Caduceus Logo + Text)
                                // Load and draw the Medical Caduceus image
                                try {
                                        byte[] imageBytes = getClass().getResourceAsStream("/images/medical_caduceus_logo.png").readAllBytes();
                                        PDImageXObject pdImage = PDImageXObject.createFromByteArray(document, imageBytes, "logo");
                                        contentStream.drawImage(pdImage, margin, yPosition - 50, 50, 50);
                                } catch (Exception e) {
                                        // Fallback if image loading fails
                                        contentStream.setNonStrokingColor(darkBlue);
                                        contentStream.addRect(margin, yPosition - 50, 50, 50);
                                        contentStream.fill();
                                        contentStream.setNonStrokingColor(java.awt.Color.WHITE);
                                        float centerX = margin + 25;
                                        float centerY = yPosition - 25;
                                        contentStream.addRect(centerX - 15, centerY - 4, 30, 8);
                                        contentStream.fill();
                                        contentStream.addRect(centerX - 4, centerY - 15, 8, 30);
                                        contentStream.fill();
                                }

                                contentStream.setNonStrokingColor(java.awt.Color.BLACK);

                                // Hospital Name
                                float titleWidth = fontBold.getStringWidth("CKD AI SPECIALIST CENTER") / 1000
                                                * 16;
                                drawText(contentStream, "CKD AI SPECIALIST CENTER", (pageWidth - titleWidth) / 2,
                                                yPosition - 20, 16, true, fontBold, fontRegular);

                                // Address
                                String address = "123 Healthcare Plaza, Medical District, Hyderabad, India";
                                float addrWidth = fontRegular.getStringWidth(address) / 1000 * 9;
                                drawText(contentStream, address, (pageWidth - addrWidth) / 2, yPosition - 35, 9, false,
                                                fontBold, fontRegular);

                                yPosition -= 60;

                                // Horizontal Line
                                contentStream.setStrokingColor(java.awt.Color.BLACK);
                                contentStream.setLineWidth(1.5f);
                                contentStream.moveTo(margin, yPosition);
                                contentStream.lineTo(pageWidth - margin, yPosition);
                                contentStream.stroke();

                                yPosition -= 15;

                                // 2. PATIENT DETAILS GRID
                                float col1X = margin;
                                float col2X = margin + 100;
                                float col3X = pageWidth / 2 + 20;
                                float col4X = col3X + 80;
                                float lineHeight = 12;

                                // Row 1
                                drawText(contentStream, "Patient Number:", col1X, yPosition, 8, true, fontBold,
                                                fontRegular);
                                drawText(contentStream, String.valueOf(user.getId()), col2X, yPosition, 8, false,
                                                fontBold, fontRegular);
                                drawText(contentStream, "Lab No:", col3X, yPosition, 8, true, fontBold, fontRegular);
                                drawText(contentStream, String.valueOf(labResult.getId()), col4X, yPosition, 8, false,
                                                fontBold, fontRegular);
                                yPosition -= lineHeight;

                                // Row 2
                                drawText(contentStream, "Patient Name:", col1X, yPosition, 8, true, fontBold,
                                                fontRegular);
                                String fullName = user.getFullName() != null ? user.getFullName() : user.getUsername();
                                drawText(contentStream, safeToUpper(fullName), col2X, yPosition, 8, false, fontBold,
                                                fontRegular);
                                drawText(contentStream, "Referred by:", col3X, yPosition, 8, true, fontBold,
                                                fontRegular);
                                drawText(contentStream, "SELF", col4X, yPosition, 8, false, fontBold, fontRegular);
                                yPosition -= lineHeight;

                                // Row 3 (Father/Husband - placeholder)
                                drawText(contentStream, "Father/Husband:", col1X, yPosition, 8, true, fontBold,
                                                fontRegular);
                                drawText(contentStream, "", col2X, yPosition, 8, false, fontBold, fontRegular);
                                drawText(contentStream, "Requested Date:", col3X, yPosition, 8, true, fontBold,
                                                fontRegular);
                                String reqDate = labResult.getTestDate() != null
                                                ? labResult.getTestDate().format(
                                                                DateTimeFormatter.ofPattern("dd-MMM-yy hh:mm a"))
                                                : LocalDateTime.now().format(
                                                                DateTimeFormatter.ofPattern("dd-MMM-yy hh:mm a"));
                                drawText(contentStream, reqDate, col4X, yPosition, 8, false, fontBold, fontRegular);
                                yPosition -= lineHeight;

                                // Row 4
                                drawText(contentStream, "Gender/Age:", col1X, yPosition, 8, true, fontBold,
                                                fontRegular);
                                String gender = profile.getGender() != null ? profile.getGender() : "N/A";
                                drawText(contentStream, safeToUpper(gender) + " / " + profile.getAge() + " Year(s)",
                                                col2X, yPosition, 8, false, fontBold, fontRegular);
                                drawText(contentStream, "Received Date:", col3X, yPosition, 8, true, fontBold,
                                                fontRegular);
                                String recDate = labResult.getTestDate() != null
                                                ? labResult.getTestDate().plusMinutes(5).format(
                                                                DateTimeFormatter.ofPattern("dd-MMM-yy hh:mm a"))
                                                : LocalDateTime.now().format(
                                                                DateTimeFormatter.ofPattern("dd-MMM-yy hh:mm a"));
                                drawText(contentStream, recDate, col4X, yPosition, 8, false, fontBold, fontRegular);
                                yPosition -= lineHeight;

                                // Row 5
                                drawText(contentStream, "Phone No:", col1X, yPosition, 8, true, fontBold, fontRegular);
                                drawText(contentStream,
                                                profile.getContactNumber() != null ? profile.getContactNumber() : "N/A",
                                                col2X, yPosition, 8, false, fontBold, fontRegular);
                                drawText(contentStream, "Verified By:", col3X, yPosition, 8, true, fontBold,
                                                fontRegular);
                                drawText(contentStream, "CKD AI SYSTEM", col4X, yPosition, 8, false, fontBold,
                                                fontRegular);
                                yPosition -= lineHeight;

                                // Row 6
                                drawText(contentStream, "Marital Status:", col1X, yPosition, 8, true, fontBold,
                                                fontRegular);
                                drawText(contentStream, "NOT SPECIFIED", col2X, yPosition, 8, false, fontBold,
                                                fontRegular);
                                drawText(contentStream, "Report Time:", col3X, yPosition, 8, true, fontBold,
                                                fontRegular);
                                drawText(contentStream,
                                                LocalDateTime.now().format(
                                                                DateTimeFormatter.ofPattern("dd-MMM-yy hh:mm a")),
                                                col4X, yPosition, 8, false, fontBold, fontRegular);
                                yPosition -= 20;

                                // Separator Line
                                contentStream.setLineWidth(0.5f);
                                contentStream.moveTo(margin, yPosition);
                                contentStream.lineTo(pageWidth - margin, yPosition);
                                contentStream.stroke();
                                yPosition -= 20;

                                // 3. REPORT BODY
                                // Section Title
                                float sectionWidth = fontBold.getStringWidth("RENAL FUNCTION TEST") / 1000 * 10;
                                drawText(contentStream, "RENAL FUNCTION TEST", (pageWidth - sectionWidth) / 2,
                                                yPosition, 10, true, fontBold, fontRegular);
                                yPosition -= 20;

                                // Table Headers
                                float[] tableCols = { margin, margin + 180, margin + 280, margin + 400, margin + 450 };
                                drawText(contentStream, "Test(s)", tableCols[0], yPosition, 9, true, fontBold,
                                                fontRegular);
                                drawText(contentStream, "Result(s)", tableCols[1], yPosition, 9, true, fontBold,
                                                fontRegular);
                                drawText(contentStream, "Reference Range(s)", tableCols[2], yPosition, 9, true,
                                                fontBold, fontRegular);
                                drawText(contentStream, "Units", tableCols[3], yPosition, 9, true, fontBold,
                                                fontRegular);
                                drawText(contentStream, "Comments", tableCols[4], yPosition, 9, true, fontBold,
                                                fontRegular);
                                yPosition -= 5;

                                // Header underline (partial?)
                                yPosition -= 10;

                                drawText(contentStream, "COMPLETE KIDNEY PROFILE", tableCols[0], yPosition, 9, true,
                                                fontBold, fontRegular);
                                yPosition -= 15;

                                // Data Logic
                                Object[][] tests = {
                                                { "Serum Creatinine", labResult.getSerumCreatinine(), 0.6, 1.2,
                                                                "mg/dL" },
                                                { "Blood Urea", labResult.getBloodUrea(), 7.0, 20.0, "mg/dL" },
                                                { "Hemoglobin", labResult.getHemoglobin(), 13.5, 17.5, "g/dL" },
                                                { "Blood Pressure", labResult.getBloodPressure(), 80.0, 120.0, "mmHg" },
                                                { "Blood Glucose", labResult.getBloodGlucoseRandom(), 70.0, 140.0,
                                                                "mg/dL" },
                                                { "Sodium", labResult.getSodium(), 135.0, 145.0, "mEq/L" },
                                                { "Potassium", labResult.getPotassium(), 3.5, 5.0, "mEq/L" },
                                                { "Albumin", labResult.getAlbumin(), 3.4, 5.4, "g/dL" },
                                                { "eGFR",
                                                                (float) (175 * Math.pow(labResult.getSerumCreatinine(),
                                                                                -1.154)
                                                                                * Math.pow(profile.getAge() > 0
                                                                                                ? profile.getAge()
                                                                                                : 30, -0.203)), // Avoid
                                                                                                                // div
                                                                                                                // by
                                                                                                                // zero
                                                                                                                // or
                                                                                                                // negative
                                                                                                                // power
                                                                                                                // issues
                                                                60, 200, "mL/min" }
                                };

                                for (Object[] test : tests) {
                                        String name = (String) test[0];
                                        float value = ((Number) test[1]).floatValue();
                                        double min = ((Number) test[2]).doubleValue();
                                        double max = ((Number) test[3]).doubleValue();
                                        String unit = (String) test[4];

                                        boolean isAbnormal = (value < min || value > max);

                                        // Allow checking low risk for GFR where high is good?
                                        // For now, simple range check is preserved as per original code

                                        drawText(contentStream, name.toUpperCase(), tableCols[0], yPosition, 8, false,
                                                        fontBold, fontRegular);

                                        // Result handling
                                        if (isAbnormal) {
                                                contentStream.setNonStrokingColor(abnormalColor);
                                        } else {
                                                contentStream.setNonStrokingColor(normalColor);
                                        }
                                        drawText(contentStream, String.format("%.1f", value), tableCols[1], yPosition,
                                                        8, true, fontBold, fontRegular);
                                        contentStream.setNonStrokingColor(java.awt.Color.BLACK);

                                        drawText(contentStream, min + "-" + max, tableCols[2], yPosition, 8, false,
                                                        fontBold, fontRegular);
                                        drawText(contentStream, unit, tableCols[3], yPosition, 8, false, fontBold,
                                                        fontRegular);

                                        yPosition -= 12;
                                }

                                // Add Risk Score Comment
                                yPosition -= 10;
                                contentStream.setNonStrokingColor(abnormalColor);

                                String riskText = "AI RISK ASSESSMENT: "
                                                + (labResult.getRiskScore() != null
                                                                ? Math.round(labResult.getRiskScore())
                                                                : 0)
                                                + "% Risk (Stage "
                                                + (labResult.getStage() != null ? labResult.getStage() : "Unknown")
                                                + ")";

                                drawText(contentStream, riskText, tableCols[0], yPosition, 9, true, fontBold,
                                                fontRegular);
                                contentStream.setNonStrokingColor(java.awt.Color.BLACK);

                                // 4. FOOTER
                                yPosition = 60; // Bottom margin for footer

                                contentStream.setLineWidth(0.5f);
                                contentStream.moveTo(margin, yPosition + 15);
                                contentStream.lineTo(pageWidth - margin, yPosition + 15);
                                contentStream.stroke();

                                contentStream.setFont(fontRegular, 7);
                                drawText(contentStream,
                                                "Electronically verified on "
                                                                + LocalDateTime.now()
                                                                                .format(DateTimeFormatter.ofPattern(
                                                                                                "dd MMM, yyyy hh:mm a"))
                                                                + ". No Signature required.",
                                                margin + 150, yPosition + 5, 7, false, fontBold, fontRegular);

                                yPosition -= 10;
                                float footerTitleWidth = fontBold.getStringWidth("Powered By Pacslink Corporation")
                                                / 1000 * 9;
                                drawText(contentStream, "Powered By Pacslink Corporation",
                                                (pageWidth - footerTitleWidth) / 2, yPosition, 9, true, fontBold,
                                                fontRegular);

                                yPosition -= 20;
                                // Signatures
                                float sigWidth = (pageWidth - 2 * margin) / 4;
                                String[] signatures = {
                                                "Prof Dr. Nadia Mahmood",
                                                "Prof Dr. Sofia Khan",
                                                "Dr. Hira Tariq",
                                                "Dr. Ume - Habiba"
                                };
                                String[] titles = {
                                                "Professor and HOD",
                                                "Director Lab HLTH",
                                                "Assistant Professor",
                                                "Assistant Professor"
                                };
                                String[] depts = {
                                                "MBBS, MPhil Chemical Pathology",
                                                "MBBS, FCPS Hematology",
                                                "MBBS, MPhil Microbiology",
                                                "MBBS, MPhil Haematology"
                                };

                                for (int i = 0; i < 4; i++) {
                                        float sigX = margin + (i * sigWidth);
                                        float curY = yPosition;
                                        drawText(contentStream, signatures[i], sigX, curY, 8, true, fontBold,
                                                        fontRegular);
                                        drawText(contentStream, titles[i], sigX, curY - 10, 7, false, fontBold,
                                                        fontRegular);
                                        drawText(contentStream, depts[i], sigX, curY - 20, 7, false, fontBold,
                                                        fontRegular);
                                }

                                // Page Number
                                drawText(contentStream, "Page 1 of 1", pageWidth - margin - 50, yPosition + 25, 7,
                                                false, fontBold, fontRegular);

                        }

                        ByteArrayOutputStream baos = new ByteArrayOutputStream();
                        document.save(baos);
                        return baos.toByteArray();
                }
        }

        // Helper for strings
        private String safeToUpper(String str) {
                return str != null ? str.toUpperCase() : "";
        }

        // Updated helper to reuse font instances
        private void drawText(PDPageContentStream contentStream, String text, float x, float y, int fontSize,
                        boolean bold, PDType1Font fontBold, PDType1Font fontRegular)
                        throws IOException {
                contentStream.beginText();
                contentStream.setFont(bold ? fontBold : fontRegular, fontSize);
                contentStream.newLineAtOffset(x, y);
                // Sanitize text: remove newlines and replace unsupported characters
                String safeText = text != null ? text : "";
                // Remove control characters and non-printable ISO-8859-1 chars roughly
                safeText = safeText.replaceAll("[\\n\\r\\t]", " ").trim();
                // Replace characters not in basic Latin/WinAnsi with '?'
                // This prevents "U+XXXX is not available in this font's encoding:
                // WinAnsiEncoding" errors
                safeText = safeText.replaceAll("[^\\x20-\\x7E]", "?");

                contentStream.showText(safeText);
                contentStream.endText();
        }
}
