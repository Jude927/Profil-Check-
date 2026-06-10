package com.profilcheck.web.controller;

import com.profilcheck.application.dto.response.dashboard.DgDashboardResponse;
import com.profilcheck.application.dto.response.dashboard.RhDashboardResponse;
import com.profilcheck.application.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/rh")
    public ResponseEntity<RhDashboardResponse> getRhDashboard() {
        return ResponseEntity.ok(dashboardService.getRhDashboardData());
    }

    @GetMapping("/dg")
    public ResponseEntity<DgDashboardResponse> getDgDashboard() {
        return ResponseEntity.ok(dashboardService.getDgDashboardData());
    }
}
