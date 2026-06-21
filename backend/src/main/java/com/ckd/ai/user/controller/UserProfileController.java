package com.ckd.ai.user.controller;

import com.ckd.ai.user.model.User;
import com.ckd.ai.user.service.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserProfileController {

    @Autowired
    private UserProfileService userProfileService;

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        return ResponseEntity.ok(userProfileService.getCurrentUser());
    }

    @PostMapping("/profile-picture")
    public ResponseEntity<?> updateProfilePicture(@RequestBody Map<String, String> request) {
        String base64Image = request.get("image");
        userProfileService.updateProfilePicture(base64Image);
        return ResponseEntity.ok(Map.of("message", "Profile picture updated successfully"));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> request) {
        String fullName = request.get("fullName");
        String email = request.get("email");
        User updatedUser = userProfileService.updateProfile(fullName, email);
        return ResponseEntity.ok(updatedUser);
    }
}
