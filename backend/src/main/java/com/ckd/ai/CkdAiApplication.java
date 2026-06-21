package com.ckd.ai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CkdAiApplication {
	public static void main(String[] args) {
		SpringApplication.run(CkdAiApplication.class, args);
	}

	@org.springframework.context.annotation.Bean
	public org.springframework.boot.CommandLineRunner init(com.ckd.ai.auth.service.AuthService authService) {
		return args -> {
			adminBootstrapping(authService);
		};
	}

	private void adminBootstrapping(com.ckd.ai.auth.service.AuthService authService) {
		try {
			authService.bootstrapAdmin();
			System.out.println("Admin bootstrapping successful: admin/admin123");
		} catch (Exception e) {
			System.err.println("Admin bootstrapping failed: " + e.getMessage());
		}
	}
}
