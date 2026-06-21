package com.ckd.ai.auth.service;

import com.ckd.ai.auth.dto.AuthResponse;
import com.ckd.ai.auth.dto.LoginRequest;
import com.ckd.ai.auth.dto.RegisterRequest;
import com.ckd.ai.config.JwtTokenProvider;
import com.ckd.ai.patient.model.PatientProfile;
import com.ckd.ai.patient.repository.PatientRepository;
import com.ckd.ai.user.model.Role;
import com.ckd.ai.user.model.User;
import com.ckd.ai.user.repository.RoleRepository;
import com.ckd.ai.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private JavaMailSender mailSender;

    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(loginRequest.getUsername()).get();
        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return new AuthResponse(jwt, user.getUsername(), user.getEmail(), user.getId(), user.getFullName(), roles);
    }

    public void register(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email Address already in use!");
        }

        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFullName(registerRequest.getFullName());

        Role userRole = roleRepository.findByName(registerRequest.getRole())
                .orElseThrow(() -> new RuntimeException("User Role not set."));

        user.setRoles(Collections.singleton(userRole));
        userRepository.save(user);

        // Auto-create PatientProfile if user is a patient
        if ("ROLE_PATIENT".equals(registerRequest.getRole())) {
            if (patientRepository.findByUser(user).isEmpty()) {
                PatientProfile profile = new PatientProfile();
                profile.setUser(user);
                profile.setAge(0);
                profile.setGender("");
                profile.setBloodGroup("");
                profile.setContactNumber("");
                profile.setAddress("");
                patientRepository.save(profile);
            }
        }
    }

    public AuthResponse bootstrapAdmin() {
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(new Role(null, "ROLE_ADMIN")));

        User admin = userRepository.findByUsername("admin").orElse(null);
        if (admin == null) {
            admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@ckd-ai.com");
            admin.setFullName("System Administrator");
        }
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRoles(Collections.singleton(adminRole));
        userRepository.save(admin);

        Set<String> roles = admin.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return new AuthResponse(null, admin.getUsername(), admin.getEmail(), admin.getId(), admin.getFullName(), roles);
    }

    public String generateResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email address."));

        // Generate 6-digit token
        String token = String.format("%06d", new Random().nextInt(999999));
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        // In a real system, we would send an email here.
        sendEmail(email, "Password Reset Token",
                "Your password reset token is: " + token + "\n\nThis token will expire in 15 minutes.");

        System.out.println("DEBUG: Password reset token for " + email + " is: " + token);
        return token;
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("ckd-ai-platform@gmail.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("Email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    public boolean verifyResetToken(String email, String token) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email address."));

        if (user.getResetToken() == null || !user.getResetToken().equals(token)) {
            return false;
        }

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return false;
        }

        return true;
    }

    public void resetPassword(String email, String token, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email address."));

        if (!verifyResetToken(email, token)) {
            throw new RuntimeException("Invalid or expired reset token.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    public boolean checkUserExists(String username) {
        return userRepository.existsByUsername(username);
    }
}
