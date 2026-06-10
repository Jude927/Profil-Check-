package com.profilcheck.infrastructure.entity;

import com.profilcheck.domain.model.enums.TypeQuestion;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "questions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QuestionEntity {

    @Id
    @UuidGenerator
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_session_id", nullable = false)
    private TestSessionEntity testSession;

    @Column(nullable = false)
    private Integer ordre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TypeQuestion type;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String enonce;

    @Column(columnDefinition = "JSON")
    private String choix;

    @Column(name = "reponse_attendue", columnDefinition = "TEXT")
    private String reponseAttendue;

    @Column(name = "points_max")
    @Builder.Default
    private Double pointsMax = 10.0;
}
