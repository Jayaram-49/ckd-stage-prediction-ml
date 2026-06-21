package com.ckd.ai.admin.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "model_versions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelVersion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String versionName;
    private float accuracy;
    private float precisionScore;
    private float recallScore;
    private float f1Score;
    private String filePath;
    private boolean isActive;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
