<div align="center">
  <h1>Gemcheck</h1>
  <p><strong>Un marco de trabajo reutilizable y orientado a la línea de comandos (CLI-First) para la gobernanza integral de la calidad de software.</strong></p>
  
  <p>
    <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React" /></a>
    <a href="https://pnpm.io/"><img src="https://img.shields.io/badge/pnpm-F69220?style=flat-square&logo=pnpm&logoColor=white" alt="pnpm" /></a>
  </p>
</div>

---

## Visión General

Gemcheck es un entorno de auditoría de calidad de software agnóstico y altamente escalable. Diseñado bajo los principios de la **Arquitectura Limpia (Clean Architecture)** y construido como un monorepo, permite la evaluación automatizada y exhaustiva de cualquier proyecto de software basado en Node.js.

En lugar de realizar análisis aislados, Gemcheck proporciona un conjunto de herramientas estandarizado para medir, rastrear y remediar la Deuda Técnica de acuerdo con los estándares de calidad **ISO/IEC 25010**.

## Arquitectura

El proyecto está estructurado como un monorepo utilizando espacios de trabajo de `pnpm` y `Turborepo`, aislando la lógica de dominio de los mecanismos de entrega.

* **`@gemcheck/domain`**: Reglas de negocio centrales. Contiene interfaces puras de TypeScript, entidades (`AuditResult`, `Metrics`) y errores. Cero dependencias externas.
* **`@gemcheck/application`**: Lógica de aplicación y orquestadores. Maneja los flujos de ejecución (Análisis Estático, Análisis Dinámico) y Casos de Uso.
* **`@gemcheck/infrastructure`**: Adaptadores concretos para el mundo exterior. Implementa integraciones con ESLint, K6, JMeter, Postman (Newman) y el sistema de archivos.
* **`@gemcheck/cli`**: La interfaz de línea de comandos. Construida con Commander.js y Zod, actúa como el punto de entrada principal para pipelines CI/CD y escaneos manuales.
* **`@gemcheck/web`** *(Opcional)*: Un panel de control independiente en React + Vite para consumir y visualizar los reportes históricos en JSON.

## Capacidades Principales

### Análisis Estático (Fase C)
Evalúa el código fuente sin ejecutarlo, centrándose en la salud estructural y la mantenibilidad.
* **Complejidad Ciclomática (McCabe):** Detecta rutas altamente complejas y difíciles de mantener.
* **Ratio de Deuda Técnica (TDR):** Cuantifica el esfuerzo de remediación frente al esfuerzo de desarrollo.
* **Índice de Mantenibilidad (MI):** Sintetiza líneas de código, métricas de Halstead y complejidad.
* **Duplicación de Código:** Identifica lógica redundante para mejorar la modularidad.
* **Escaneo de Vulnerabilidades (SAST):** Resalta posibles fallas de seguridad antes del tiempo de ejecución.

### Pruebas Dinámicas (Fase B)
Evalúa el sistema en tiempo de ejecución bajo diversas condiciones.
* **Pruebas de Carga y Estrés:** Orquestación automatizada de picos de tráfico para medir la latencia, el rendimiento y los puntos de ruptura del sistema.
* **Resiliencia y Caos:** Inyección de fallas simuladas (ej. latencia de base de datos, entradas malformadas) para evaluar los mecanismos de recuperación.
* **Pruebas de Contrato:** Comprueba las respuestas de las APIs frente a esquemas establecidos para garantizar la compatibilidad.

## Uso

*Esta sección se ampliará a medida que la interfaz CLI esté completamente implementada.*

```bash
# Ejemplo de uso (API planificada)
$ gemcheck scan --project ./mi-proyecto-objetivo --config audit.json
```

## Primeros Pasos

### Requisitos Previos
* Node.js (v18 o superior)
* pnpm (v8 o superior)

### Instalación

1. Clona el repositorio e instala las dependencias:
   ```bash
   pnpm install
   ```
2. Construye los paquetes del espacio de trabajo:
   ```bash
   pnpm build
   ```
3. Ejecuta el entorno de desarrollo:
   ```bash
   pnpm dev
   ```

## Desarrollo y Contribución

Gemcheck impone límites arquitectónicos estrictos. Al contribuir, asegúrate de que:
1. `domain` permanezca libre de dependencias externas.
2. `application` dependa únicamente de `domain`.
3. `infrastructure` implemente los contratos definidos en `domain`.

Para ejecutar las pruebas en todos los paquetes:
```bash
pnpm test
```

---
<div align="center">
  <small>Construido para una calidad de software intransigente.</small>
</div>
