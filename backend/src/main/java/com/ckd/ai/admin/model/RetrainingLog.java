package com.ckd.ai.admin.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "retraining_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RetrainingLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int newRecordsCount;
    private float oldAccuracy;
    private float newAccuracy;
    private String status; // SUCCESS, FAILED
    private String triggeredBy; // SYSTEM, ADMIN

    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
