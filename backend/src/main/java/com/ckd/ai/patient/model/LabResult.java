package com.ckd.ai.patient.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "lab_results")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private PatientProfile patient;

    // Clinical Features
    private Integer age;
    private float bloodPressure;
    private float specificGravity;
    private float albumin;
    private float sugar;
    private String redBloodCells;
    private String pusCell;
    private String pusCellClumps;
    private String bacteria;
    private float bloodGlucoseRandom;
    private float bloodUrea;
    private float serumCreatinine;
    private float sodium;
    private float potassium;
    private float hemoglobin;
    private float packedCellVolume;
    private float whiteBloodCellCount;
    private float redBloodCellCount;
    private String hypertension;
    private String diabetesMellitus;
    private String coronaryArteryDisease;
    private String appetite;
    private String pedaEdema;
    private String aanemia;

    // Prediction Results
    private Integer stage;
    private Float riskScore;
    private String ckdDetected;
    private Float confidence;

    private LocalDateTime testDate;

    @PrePersist
    protected void onTest() {
        testDate = LocalDateTime.now();
    }
}
