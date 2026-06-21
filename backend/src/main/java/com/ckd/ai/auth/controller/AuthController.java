package com.ckd.ai.auth.controller;

import com.ckd.ai.auth.dto.AuthResponse;
import com.ckd.ai.auth.dto.LoginRequest;
import com.ckd.ai.auth.dto.RegisterRequest;
import com.ckd.ai.auth.dto.ResetPasswordRequest;
import com.ckd.ai.auth.service.AuthService;
import com.ckd.ai.common.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            System.out.println("Login attempt for username: " + loginRequest.getUsername());
            AuthResponse authResponse = authService.login(loginRequest);
            return ResponseEntity.ok(authResponse);
        } catch (org.springframework.security.core.AuthenticationException e) {
            System.err
                    .println("Authentication failed for user '" + loginRequest.getUsername() + "': " + e.getMessage());
            return ResponseEntity.status(401).body(new ApiResponse(false, "Invalid username or password"));
        } catch (Exception e) {
            System.err.println("Unexpected error during login: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse(false, "An error occurred during login: " + e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getAuthStatus() {
        return ResponseEntity.ok(new java.util.HashMap<String, Object>() {
            {
                put("status", "Auth service is up");
                put("timestamp", new java.util.Date());
                put("adminExists", authService.checkUserExists("admin"));
            }
        });
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        authService.register(registerRequest);
        return ResponseEntity.ok(new ApiResponse(true, "User registered successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody java.util.Map<String, String> request) {
        try {
            String token = authService.generateResetToken(request.get("email"));
            return ResponseEntity.ok(new java.util.HashMap<String, Object>() {
                {
                    put("success", true);
                    put("message", "Password reset token generated.");
                    put("debugToken", token); // Including token for demo/debug
                }
            });
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/verify-token")
    public ResponseEntity<?> verifyToken(@RequestBody java.util.Map<String, String> request) {
        boolean isValid = authService.verifyResetToken(request.get("email"), request.get("token"));
        if (isValid) {
            return ResponseEntity.ok(new ApiResponse(true, "Token is valid."));
        } else {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Invalid or expired token."));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest resetPasswordRequest) {
        try {
            authService.resetPassword(resetPasswordRequest.getEmail(), resetPasswordRequest.getToken(),
                    resetPasswordRequest.getNewPassword());
            return ResponseEntity.ok(new ApiResponse(true, "Password reset successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/bootstrap-admin")
    public ResponseEntity<?> bootstrapAdmin() {
        authService.bootstrapAdmin();
        return ResponseEntity.ok(new ApiResponse(true, "Admin reset to admin/admin123"));
    }
}
