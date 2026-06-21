package com.ckd.ai.patient.controller;

import com.ckd.ai.common.dto.ApiResponse;
import com.ckd.ai.patient.model.LabResult;
import com.ckd.ai.patient.service.PatientService;
import com.ckd.ai.user.model.User;
import com.ckd.ai.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/patient")
@PreAuthorize("hasRole('PATIENT')")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/lab-data")
    public ResponseEntity<?> submitLabData(@RequestBody LabResult labResult,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).get();
        return ResponseEntity.ok(patientService.saveAndPredict(labResult, user));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).get();
        return ResponseEntity.ok(patientService.getPatientHistory(user));
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<?> deleteHistory(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).get();
        patientService.deleteLabResult(id, user);
        return ResponseEntity.ok(new ApiResponse(true, "Lab result deleted successfully"));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).get();
        return ResponseEntity.ok(patientService.getPatientProfile(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody java.util.Map<String, Object> updateData,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).get();
        return ResponseEntity.ok(patientService.updatePatientProfile(user, updateData));
    }

    @GetMapping("/result/{id}/explain")
    public ResponseEntity<?> getExplanations(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).get();
        return ResponseEntity.ok(patientService.getExplanations(id, user));
    }

    @GetMapping(value = "/result/{id}/pdf")
    public ResponseEntity<?> downloadPdfReport(@PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername()).get();
            byte[] pdfBytes = patientService.generatePdfReport(id, user);

            ContentDisposition contentDisposition = ContentDisposition.attachment()
                    .filename("ckd-report-" + id + ".pdf")
                    .build();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(contentDisposition);
            headers.setContentLength(pdfBytes.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (IllegalArgumentException | SecurityException e) {
            logErrorToFile(e);
            return ResponseEntity.badRequest().body("Client Error: " + e.getMessage());
        } catch (IOException e) {
            logErrorToFile(e);
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error generating PDF: " + e.getMessage());
        } catch (Throwable e) {
            logErrorToFile(e);
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Internal Server Error: " + e.getMessage());
        }
    }

    private void logErrorToFile(Throwable e) {
        String logPath = "d:\\Ckd\\Batch-12 Chronic Kidney Disease Staging & Risk Prediction Platform\\backend\\debug_error.log";
        try (java.io.PrintWriter pw = new java.io.PrintWriter(new java.io.FileWriter(logPath, true))) {
            pw.println("Timestamp: " + java.time.LocalDateTime.now());
            pw.println("Error Type: " + e.getClass().getName());
            pw.println("Error Message: " + e.getMessage());
            e.printStackTrace(pw);
            pw.println("--------------------------------------------------");
        } catch (java.io.IOException ioEx) {
            ioEx.printStackTrace();
        }
    }
}
