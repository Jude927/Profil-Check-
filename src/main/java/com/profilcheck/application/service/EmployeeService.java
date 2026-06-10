package com.profilcheck.application.service;

import com.profilcheck.application.dto.request.employee.CreateEmployeeRequest;
import com.profilcheck.application.dto.response.employee.EmployeeResponse;
import com.profilcheck.application.dto.response.employee.EmployeeSummaryResponse;
import com.profilcheck.domain.model.enums.StatutProfil;
import com.profilcheck.infrastructure.entity.*;
import com.profilcheck.infrastructure.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;

    public List<EmployeeSummaryResponse> searchEmployees(String statut, String departmentId) {
        List<EmployeeEntity> employees;
        if (departmentId != null) {
            employees = employeeRepository.findAllByUserDepartmentId(departmentId);
        } else if (statut != null) {
            employees = employeeRepository.findAllByStatut(StatutProfil.valueOf(statut));
        } else {
            employees = employeeRepository.findAll();
        }

        return employees.stream().map(e -> EmployeeSummaryResponse.builder()
                .id(e.getId())
                .nom(e.getUser().getNom())
                .prenom(e.getUser().getPrenom())
                .statut(e.getStatut().name())
                .departmentName(e.getUser().getDepartment() != null ? e.getUser().getDepartment().getName() : "N/A")
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional
    public EmployeeResponse createEmployee(CreateEmployeeRequest request) {
        UserEntity user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        EmployeeEntity employee = EmployeeEntity.builder()
                .user(user)
                .dateEmbauche(request.getDateEmbauche())
                .statut(StatutProfil.EN_ATTENTE)
                .build();

        EmployeeEntity saved = employeeRepository.save(employee);

        if (request.getSkills() != null) {
            List<EmployeeSkillEntity> skills = request.getSkills().stream().map(s -> {
                SkillEntity skill = skillRepository.findById(s.getSkillId()).orElseThrow();
                return EmployeeSkillEntity.builder()
                        .id(new EmployeeSkillId(saved.getId(), skill.getId()))
                        .employee(saved)
                        .skill(skill)
                        .yearsXp(s.getYearsXp())
                        .build();
            }).collect(Collectors.toList());
            saved.getSkills().addAll(skills);
        }

        if (request.getDiplomas() != null) {
            List<DiplomaEntity> diplomas = request.getDiplomas().stream().map(d -> DiplomaEntity.builder()
                    .employee(saved)
                    .titre(d.getTitre())
                    .institution(d.getInstitution())
                    .annee(d.getAnnee())
                    .build()).collect(Collectors.toList());
            saved.getDiplomas().addAll(diplomas);
        }

        return mapToResponse(employeeRepository.save(saved));
    }

    public EmployeeResponse getEmployeeById(String id) {
        EmployeeEntity e = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employé introuvable"));
        return mapToResponse(e);
    }

    private EmployeeResponse mapToResponse(EmployeeEntity e) {
        return EmployeeResponse.builder()
                .id(e.getId())
                .nom(e.getUser().getNom())
                .prenom(e.getUser().getPrenom())
                .email(e.getUser().getEmail())
                .statut(e.getStatut().name())
                .departmentName(e.getUser().getDepartment() != null ? e.getUser().getDepartment().getName() : "N/A")
                .skills(e.getSkills().stream().map(s -> EmployeeResponse.SkillInfo.builder()
                        .name(s.getSkill().getName()).yearsXp(s.getYearsXp()).category(s.getSkill().getCategory()).build()
                ).collect(Collectors.toList()))
                .diplomas(e.getDiplomas().stream().map(d -> EmployeeResponse.DiplomaInfo.builder()
                        .titre(d.getTitre()).institution(d.getInstitution()).annee(d.getAnnee()).build()
                ).collect(Collectors.toList()))
                .build();
    }
}
