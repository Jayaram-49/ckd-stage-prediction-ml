package com.ckd.ai.patient.repository;

import com.ckd.ai.patient.model.LabResult;
import com.ckd.ai.patient.model.PatientProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LabResultRepository extends JpaRepository<LabResult, Long> {
    List<LabResult> findByPatientOrderByTestDateDesc(PatientProfile patient);
}
