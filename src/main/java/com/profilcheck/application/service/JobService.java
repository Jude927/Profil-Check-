package com.profilcheck.application.service;

import com.profilcheck.application.dto.request.job.CreateJobRequest;
import com.profilcheck.infrastructure.entity.DepartmentEntity;
import com.profilcheck.infrastructure.entity.JobEntity;
import com.profilcheck.infrastructure.entity.SkillEntity;
import com.profilcheck.infrastructure.repository.DepartmentRepository;
import com.profilcheck.infrastructure.repository.JobRepository;
import com.profilcheck.infrastructure.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final DepartmentRepository departmentRepository;
    private final SkillRepository skillRepository;

    public List<JobEntity> getAllJobs() {
        return jobRepository.findAll();
    }

    public JobEntity createJob(CreateJobRequest request) {
        DepartmentEntity dept = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Département introuvable"));

        List<SkillEntity> skills = skillRepository.findAllById(request.getRequiredSkillIds());

        JobEntity job = JobEntity.builder()
                .title(request.getTitle())
                .department(dept)
                .yearsXpRequired(request.getYearsXpRequired())
                .scThreshold(request.getScThreshold())
                .requiredSkills(skills)
                .requiredDiplomas(request.getRequiredDiplomas())
                .build();

        return jobRepository.save(job);
    }
}
