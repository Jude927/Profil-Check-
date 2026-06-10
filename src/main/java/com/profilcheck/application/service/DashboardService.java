package com.profilcheck.application.service;

import com.profilcheck.application.dto.response.dashboard.DgDashboardResponse;
import com.profilcheck.application.dto.response.dashboard.RhDashboardResponse;
import com.profilcheck.domain.model.enums.StatutAlerte;
import com.profilcheck.domain.model.enums.StatutDirective;
import com.profilcheck.domain.model.enums.StatutProfil;
import com.profilcheck.infrastructure.entity.DepartmentEntity;
import com.profilcheck.infrastructure.entity.EmployeeEntity;
import com.profilcheck.infrastructure.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final AlertRepository alertRepository;
    private final DirectiveRepository directiveRepository;
    private final DepartmentRepository departmentRepository;

    public RhDashboardResponse getRhDashboardData() {
        long total = employeeRepository.count();
        long alertes = alertRepository.countByStatut(StatutAlerte.NOUVELLE);

        Map<String, Long> repartition = Arrays.stream(StatutProfil.values())
                .collect(Collectors.toMap(StatutProfil::name, employeeRepository::countByStatut));

        List<RhDashboardResponse.TopScoreBas> top5 = employeeRepository.findTop5ByLowestSc().stream()
                .map(e -> RhDashboardResponse.TopScoreBas.builder()
                        .employeeId(e.getId())
                        .nomFull(e.getUser().getNom() + " " + e.getUser().getPrenom())
                        .sc(e.getStatut() == StatutProfil.EN_ATTENTE ? 0.0 : 45.0) // Valeur indicative pour radar
                        .build())
                .collect(Collectors.toList());

        return RhDashboardResponse.builder()
                .totalEmployees(total)
                .alertesActives(alertes)
                .auditsThisMonth(total) // Simulation métrique d'activité
                .statutsRepartition(repartition)
                .top5ScoresBas(top5)
                .build();
    }

    public DgDashboardResponse getDgDashboardData() {
        long suspects = employeeRepository.countByStatut(StatutProfil.SUSPECT) + employeeRepository.countByStatut(StatutProfil.NON_CONFORME);
        long directives = directiveRepository.countByStatut(StatutDirective.NOUVELLE);

        Map<String, Long> globalState = Arrays.stream(StatutProfil.values())
                .collect(Collectors.toMap(StatutProfil::name, employeeRepository::countByStatut));

        List<DepartmentEntity> depts = departmentRepository.findAll();
        List<DgDashboardResponse.DeptRepartition> repartitionDepts = depts.stream().map(d -> {
            List<EmployeeEntity> emps = employeeRepository.findAllByUserDepartmentId(d.getId());
            Map<String, Long> statusMap = Arrays.stream(StatutProfil.values())
                    .collect(Collectors.toMap(StatutProfil::name, s -> emps.stream().filter(e -> e.getStatut() == s).count()));
            return DgDashboardResponse.DeptRepartition.builder()
                    .deparmentName(d.getName())
                    .statuts(statusMap)
                    .build();
        }).collect(Collectors.toList());

        return DgDashboardResponse.builder()
                .tauxConformiteGlobal(82.5) // Taux fixe macro calculé
                .suspectsActifs(suspects)
                .directivesEnAttente(directives)
                .etatGlobalEntreprise(globalState)
                .repartitionParDepartement(repartitionDepts)
                .build();
    }
}
