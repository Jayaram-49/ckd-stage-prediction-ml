package com.ckd.ai.doctor.controller;

import com.ckd.ai.doctor.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/doctor")
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @GetMapping("/patients")
    public ResponseEntity<?> getPatients() {
        return ResponseEntity.ok(doctorService.getAllPatients());
    }

    @GetMapping("/patient/{id}/history")
    public ResponseEntity<?> getPatientHistory(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().body("ID cannot be null");
        }
        return ResponseEntity.ok(doctorService.getPatientLabHistory(id));
    }

    @GetMapping("/result/{id}/explain")
    public ResponseEntity<?> getExplanations(@PathVariable @org.springframework.lang.NonNull Long id) {
        return ResponseEntity.ok(doctorService.getExplanations(id));
    }

    @GetMapping("/result/{id}/pdf")
    public ResponseEntity<?> downloadPdfReport(@PathVariable @org.springframework.lang.NonNull Long id) {
        try {
            byte[] pdfBytes = doctorService.generatePdfReport(id);

            org.springframework.http.ContentDisposition contentDisposition = org.springframework.http.ContentDisposition
                    .attachment()
                    .filename("ckd-report-" + id + ".pdf")
                    .build();

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
            headers.setContentDisposition(contentDisposition);
            headers.setContentLength(pdfBytes.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (java.io.IOException e) {
            return ResponseEntity.internalServerError().body("Error generating PDF: " + e.getMessage());
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getDoctorProfile() {
        return ResponseEntity.ok(doctorService.getDoctorProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateDoctorProfile(@RequestBody java.util.Map<String, String> request) {
        String contactNumber = request.get("contactNumber");
        String address = request.get("address");
        return ResponseEntity.ok(doctorService.updateDoctorProfile(contactNumber, address));
    }
}
