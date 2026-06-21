package com.ckd.ai.patient.repository;

import com.ckd.ai.patient.model.PatientProfile;
import com.ckd.ai.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<PatientProfile, Long> {
    Optional<PatientProfile> findByUser(User user);
}
