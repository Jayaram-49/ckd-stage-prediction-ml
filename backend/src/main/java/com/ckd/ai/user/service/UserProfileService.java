package com.ckd.ai.user.service;

import com.ckd.ai.user.model.User;
import com.ckd.ai.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Objects;

@Service
public class UserProfileService {

    @Autowired
    private UserRepository userRepository;

    @org.springframework.lang.NonNull
    public User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return Objects.requireNonNull(
                userRepository.findByUsername(username)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username)));
    }

    public void updateProfilePicture(String base64Image) {
        User user = getCurrentUser();
        user.setProfilePicture(base64Image);
        userRepository.save(user);
    }

    @org.springframework.lang.NonNull
    public User updateProfile(String fullName, String email) {
        User user = getCurrentUser();
        if (fullName != null)
            user.setFullName(fullName);
        if (email != null)
            user.setEmail(email);
        return userRepository.save(user);
    }
}
