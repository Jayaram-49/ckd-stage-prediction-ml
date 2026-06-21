package com.ckd.ai.admin.repository;

import com.ckd.ai.admin.model.RetrainingLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RetrainingLogRepository extends JpaRepository<RetrainingLog, Long> {
}
