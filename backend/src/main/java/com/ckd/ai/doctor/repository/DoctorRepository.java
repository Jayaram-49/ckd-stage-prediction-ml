package com.ckd.ai.doctor.repository;

import com.ckd.ai.doctor.model.DoctorProfile;
import com.ckd.ai.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<DoctorProfile, Long> {
    Optional<DoctorProfile> findByUser(User user);
}
