/**
 * Configuración modular de umbrales y penalizaciones para el análisis evolutivo (Git).
 * Estos valores definen matemáticamente cuándo una métrica se considera "saludable" o un "riesgo".
 */

export type GitAnalyzerConfig = typeof GIT_ANALYZER_THRESHOLDS;

export const GIT_ANALYZER_THRESHOLDS = {
  // --- 1. Puntos Calientes (Hotspots) ---
  HOTSPOTS: {
    // Si un archivo recibe más de este número de commits, suma puntos de riesgo
    HIGH_COMMITS_THRESHOLD: 10,
    MEDIUM_COMMITS_THRESHOLD: 5,
    
    // Si un archivo ha recibido más de este número de arreglos (fixes), suma puntos de riesgo
    HIGH_FIXES_THRESHOLD: 5,
    MEDIUM_FIXES_THRESHOLD: 2,
    
    // Nivel de agitación (Líneas agregadas + eliminadas)
    HIGH_CHURN_THRESHOLD: 1000,
    MEDIUM_CHURN_THRESHOLD: 300,

    // Puntuaciones que determinan el nivel de riesgo final del Hotspot (sobre 100)
    CRITICAL_SCORE: 60,
    WARNING_SCORE: 30
  },

  // --- 2. Bus Factor (Conocimiento Cerrado) ---
  BUS_FACTOR: {
    // Un archivo necesita tener al menos este número de commits históricos para ser evaluado (evita falsos positivos en archivos nuevos)
    MIN_COMMITS_TO_EVALUATE: 5,
    // Porcentaje mínimo de propiedad por un solo autor para que el archivo sea considerado un riesgo de Bus Factor
    CRITICAL_OWNERSHIP_PERCENTAGE: 80
  },

  // --- 3. Acoplamiento Lógico ---
  COUPLING: {
    // Número de veces que dos archivos deben modificarse juntos en el mismo commit para considerarlos acoplados
    MIN_CO_CHANGES: 3,
    // Porcentaje mínimo de coincidencia para declararlos dependientes lógicamente
    MIN_COUPLING_PERCENTAGE: 60,
    // Límite de archivos tocados en un solo commit para evaluarlo (si un commit toca 50 archivos, suele ser un refactor masivo automatizado y se ignora)
    MAX_FILES_IN_COMMIT_TO_EVALUATE: 20
  },

  // --- 4. Métricas Avanzadas (Insights) ---
  ADVANCED: {
    // Límite de cantidad de archivos para clasificar un commit por su atomicidad
    ATOMICITY_SMALL_MAX_FILES: 2,
    ATOMICITY_MEDIUM_MAX_FILES: 9,
    // A partir de ATOMICITY_MEDIUM_MAX_FILES, se considera un commit "Large" o Masivo.

    // Meses sin modificaciones para que un archivo se considere "abandonado" o huérfano
    MONTHS_TO_BE_ABANDONED: 6,
    // Número de desarrolladores distintos editando el mismo archivo para considerarlo un "Cuello de botella" (Intersection Complexity)
    MIN_AUTHORS_FOR_BOTTLENECK: 3
  },

  // --- 5. Penalizaciones para el Team Health Score ---
  HEALTH_PENALTIES: {
    // Cuántos puntos de salud (sobre 100) se pierden por cada problema encontrado
    PER_HIGH_RISK_HOTSPOT: 5,
    PER_CRITICAL_BUS_FACTOR_FILE: 10,
    PER_HIGH_COUPLING_PAIR: 5,
    
    // Penalización por mala atomicidad: Si el % de commits grandes supera este umbral, se pierden puntos
    LARGE_COMMITS_WARNING_PERCENTAGE: 30,
    LARGE_COMMITS_PENALTY: 10,
    
    // Penalización por fatiga de fin de semana: Si el % de bugs en viernes supera este umbral, se pierden puntos
    FRIDAY_FIXES_WARNING_PERCENTAGE: 15,
    FRIDAY_FIXES_PENALTY: 5,

    // Escala de calificación final
    GRADES: {
      A: 90,
      B: 80,
      C: 70,
      D: 60
    }
  },

  // --- 6. Triage Inteligente (Priorización) ---
  TRIAGE: {
    // Pesos porcentuales para la fórmula de prioridad de archivos (deben sumar 100)
    AST_DEBT_WEIGHT: 40,
    GIT_RISK_WEIGHT: 60
  }
};
