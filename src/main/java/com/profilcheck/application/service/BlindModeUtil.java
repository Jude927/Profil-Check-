package com.profilcheck.application.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public class BlindModeUtil {
    /**
     * Génère un identifiant cryptique unique et stable à partir de l'ID pour remplacer le Nom/Prénom.
     * Exemple : "AUDIT-A4F8E2"
     */
    public static String anonymize(String employeeId) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(employeeId.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (int i = 0; i < 3; i++) { // On prend les 3 premiers octets pour un code court
                String hex = Integer.toHexString(0xff & hash[i]);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return "AUDIT-" + hexString.toString().toUpperCase();
        } catch (Exception e) {
            return "AUDIT-ANONYME";
        }
    }
}
