package com.ckd.ai.doctor.service;

import java.util.Objects;
import java.util.List;
import org.springframework.lang.NonNull;
import com.ckd.ai.doctor.model.DoctorProfile;
import com.ckd.ai.doctor.repository.DoctorRepository;
import com.ckd.ai.user.model.User;
import com.ckd.ai.patient.model.LabResult;
import com.ckd.ai.patient.model.PatientProfile;
import com.ckd.ai.patient.repository.LabResultRepository;
import com.ckd.ai.patient.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DoctorService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private LabResultRepository labResultRepository;

    @Autowired
    private com.ckd.ai.patient.service.PatientService patientService;

    @Autowired
    private com.ckd.ai.user.service.UserProfileService userProfileService;

    @NonNull
    public List<PatientProfile> getAllPatients() {
        return Objects.requireNonNull(patientRepository.findAll());
    }

    @NonNull
    public List<LabResult> getPatientLabHistory(@NonNull Long patientId) {
        PatientProfile profile = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return Objects.requireNonNull(labResultRepository.findByPatientOrderByTestDateDesc(profile));
    }

    @NonNull
    public List<java.util.Map<String, Object>> getExplanations(@NonNull Long labResultId) {
        LabResult labResult = labResultRepository.findById(labResultId)
                .orElseThrow(() -> new RuntimeException("Lab result not found"));
        return Objects.requireNonNull(patientService.getExplanationsInternal(labResult));
    }

    @NonNull
    public byte[] generatePdfReport(@NonNull Long labResultId) throws java.io.IOException {
        LabResult labResult = labResultRepository.findById(labResultId)
                .orElseThrow(() -> new RuntimeException("Lab result not found"));
        return Objects
                .requireNonNull(patientService.generatePdfReportInternal(labResult, labResult.getPatient().getUser()));
    }

    @NonNull
    public DoctorProfile getDoctorProfile() {
        User user = userProfileService.getCurrentUser();
        java.util.Optional<DoctorProfile> existing = doctorRepository.findByUser(user);

        if (existing.isPresent()) {
            DoctorProfile profile = existing.get();
            if (profile == null)
                throw new RuntimeException("Doctor profile is null");
            return profile;
        }

        DoctorProfile newProfile = DoctorProfile.builder().user(user).build();
        if (newProfile == null)
            throw new RuntimeException("Could not build doctor profile");

        DoctorProfile saved = doctorRepository.save(newProfile);
        return saved;
    }

    @NonNull
    public DoctorProfile updateDoctorProfile(String contactNumber, String address) {
        DoctorProfile profile = getDoctorProfile();
        // getDoctorProfile is @NonNull, so profile is guaranteed non-null here

        if (contactNumber != null) {
            profile.setContactNumber(contactNumber);
        }
        if (address != null) {
            profile.setAddress(address);
        }

        DoctorProfile saved = doctorRepository.save(profile);
        return saved;
    }
}
