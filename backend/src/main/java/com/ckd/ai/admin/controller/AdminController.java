package com.ckd.ai.admin.controller;

import com.ckd.ai.admin.service.AdminService;
import com.ckd.ai.common.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @PostMapping("/retrain")
    public ResponseEntity<?> triggerRetrain() {
        adminService.triggerRetraining("ADMIN");
        return ResponseEntity.ok(new ApiResponse(true, "Retraining triggered successfully"));
    }

    @PostMapping("/seed")
    public ResponseEntity<?> seedBaseData() {
        String message = adminService.seedBaseData();
        return ResponseEntity.ok(new ApiResponse(true, message));
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        String newPassword = body.get("newPassword");
        adminService.resetUserPassword(id, newPassword);
        return ResponseEntity.ok(new ApiResponse(true, "Password reset successfully"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(new ApiResponse(true, "User deleted successfully"));
    }

    @GetMapping("/patients")
    public ResponseEntity<?> getPatients() {
        return ResponseEntity.ok(adminService.getAllPatients());
    }

    @GetMapping("/patient/{id}")
    public ResponseEntity<?> getPatient(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getPatientDetails(id));
    }

    @GetMapping("/lab-results")
    public ResponseEntity<?> getLabResults() {
        return ResponseEntity.ok(adminService.getAllLabResults());
    }

    @GetMapping("/roles")
    public ResponseEntity<?> getRoles() {
        return ResponseEntity.ok(adminService.getAllRoles());
    }

    @GetMapping("/admins")
    public ResponseEntity<?> getAdministrators() {
        return ResponseEntity.ok(adminService.getAdministrators());
    }

    @GetMapping("/role-details/{roleName}")
    public ResponseEntity<?> getRoleDetails(@PathVariable String roleName) {
        return ResponseEntity.ok(adminService.getRoleDetails(roleName));
    }

    @DeleteMapping("/lab-results/{id}")
    public ResponseEntity<?> deleteLabResult(@PathVariable Long id) {
        adminService.deleteLabResult(id);
        return ResponseEntity.ok(new ApiResponse(true, "Lab result deleted successfully"));
    }

    @GetMapping("/logs")
    public ResponseEntity<?> getLogs() {
        return ResponseEntity.ok(adminService.getAuditLogs());
    }

    @GetMapping("/metrics")
    public ResponseEntity<?> getMetrics() {
        return ResponseEntity.ok(adminService.getModelMetrics());
    }

    @GetMapping("/datasets/statistics")
    public ResponseEntity<?> getDatasetStatistics() {
        return ResponseEntity.ok(adminService.getDatasetStatistics());
    }

    @PostMapping("/datasets/upload")
    public ResponseEntity<?> uploadDataset(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(adminService.uploadDataset(file));
    }
}
