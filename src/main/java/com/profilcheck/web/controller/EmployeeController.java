package com.profilcheck.web.controller;

import com.profilcheck.application.dto.request.employee.CreateEmployeeRequest;
import com.profilcheck.application.dto.response.employee.EmployeeResponse;
import com.profilcheck.application.dto.response.employee.EmployeeSummaryResponse;
import com.profilcheck.application.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService javaEmployeeService;

    @GetMapping
    public ResponseEntity<List<EmployeeSummaryResponse>> getEmployees(
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) String departmentId,
            @RequestParam(defaultValue = "false") boolean useBlindMode) {
        
        List<EmployeeSummaryResponse> responses = javaEmployeeService.searchEmployees(statut, departmentId);
        
        if (useBlindMode) {
            responses.forEach(emp -> {
                String pseudo = com.profilcheck.application.service.BlindModeUtil.anonymize(emp.getId());
                emp.setNom(pseudo);
                emp.setPrenom("Anonyme");
            });
        }
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponse> getEmployeeById(@PathVariable String id) {
        return ResponseEntity.ok(javaEmployeeService.getEmployeeById(id));
    }

    @PostMapping
    public ResponseEntity<EmployeeResponse> createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        return ResponseEntity.ok(javaEmployeeService.createEmployee(request));
    }
}
