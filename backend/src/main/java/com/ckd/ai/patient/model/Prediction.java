package com.ckd.ai.patient.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "predictions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Prediction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "lab_result_id")
    private LabResult labResult;

    private int stage;
    private float riskScore;
    private String ckdDetected;
    private float confidence;
    
    @Column(columnDefinition = "TEXT")
    private String explanation; // SHAP summary or human readable

    private LocalDateTime predictionDate;

    @PrePersist
    protected void onPredict() {
        predictionDate = LocalDateTime.now();
    }
}
