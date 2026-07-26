<div align="center">
  <h1>Gemcheck</h1>
  <p><strong>Tu asistente de línea de comandos para cuidar la salud de tu código.</strong></p>
  
  <p>
    <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React" /></a>
    <a href="https://pnpm.io/"><img src="https://img.shields.io/badge/pnpm-F69220?style=flat-square&logo=pnpm&logoColor=white" alt="pnpm" /></a>
  </p>
</div>

---

## ¿Qué es Gemcheck?

Gemcheck es una herramienta amigable que te ayuda a evaluar y mejorar la calidad de tus proyectos hechos en Node.js. En lugar de tener que revisar el código a mano, Gemcheck automatiza el proceso para que puedas detectar problemas a tiempo, como archivos que cambian demasiado, cuellos de botella en el equipo y dependencias ocultas. Todo esto funciona desde tu terminal, por lo que es muy fácil de usar y de integrar en tus rutinas de trabajo diarias.

El proyecto está organizado en un "monorepo" y sigue los principios de la Arquitectura Limpia, lo que significa que el código está muy bien separado y es fácil de mantener.

## Estructura del Proyecto

* **`@gemcheck/domain`**: El núcleo de la herramienta. Aquí guardamos las reglas y configuraciones principales sin depender de nada externo.
* **`@gemcheck/application`**: La lógica que hace que todo funcione. Conecta las reglas del dominio con las herramientas externas.
* **`@gemcheck/infrastructure`**: La capa que se comunica con el mundo exterior (como bases de datos SQLite, lectura de archivos e historial de Git).
* **`@gemcheck/cli`**: La interfaz de la terminal. Es lo que interactúa contigo cuando escribes `gemcheck` en la consola.
* **`@gemcheck/dashboard`**: Un panel de control visual hecho en React para que puedas ver los reportes de manera gráfica y ajustar la configuración.

## Funcionalidades Actuales

Actualmente, Gemcheck ya puede hacer varias cosas geniales por tu proyecto:

* **Análisis Evolutivo de Git:**
  * **Hotspots (Puntos Calientes):** Detecta qué archivos cambian con demasiada frecuencia y podrían tener problemas o bugs ocultos.
  * **Bus Factor:** Identifica si partes críticas del código dependen de una sola persona, lo cual es un riesgo para el equipo.
  * **Acoplamiento Lógico:** Descubre qué archivos suelen modificarse siempre juntos, lo que ayuda a ver dependencias que tal vez no sabías que existían.
* **Panel de Control Visual (Dashboard):** Una interfaz web limpia y amigable para ver los resultados de tus análisis.
* **Configuración Dinámica:** Puedes ajustar todos los valores y umbrales de los análisis a través de la interfaz web. Todo se guarda de forma persistente en una base de datos local para tus futuros análisis.

## Funcionalidades Planificadas

Estamos trabajando para que Gemcheck sea aún más completo. En el futuro, añadiremos:

* **Análisis Estático Avanzado:**
  * Evaluación de complejidad ciclomática para encontrar código difícil de leer.
  * Detección de código duplicado.
  * Escaneo básico de vulnerabilidades (SAST).
* **Pruebas Dinámicas:**
  * Pruebas de carga y estrés automatizadas para medir el rendimiento.
  * Pruebas de caos (simular caídas y lentitud).
  * Pruebas de contrato para asegurar que las APIs se comunican correctamente.

## Uso

Gemcheck está diseñado para ser flexible. Puedes usarlo como una herramienta de línea de comandos en cualquier proyecto o integrarlo directamente en tu código.

### Como herramienta de terminal (CLI)

La forma más fácil de usar Gemcheck en cualquier proyecto es ejecutándolo con `npx` sin necesidad de instalar nada globalmente:

```bash
# Navega al proyecto que quieres analizar
cd mi-proyecto

# Ejecuta el escaneo de git
npx @gemcheck/cli git

# O abre el panel de control
npx @gemcheck/cli config --ui
```

Si prefieres tenerlo disponible en tu sistema en todo momento, puedes instalarlo globalmente:

```bash
npm install -g @gemcheck/cli

# Ahora puedes usarlo en cualquier lugar:
gemcheck git
gemcheck config --ui
```

### Como paquete dentro de tu proyecto

Si quieres utilizar las herramientas de Gemcheck dentro de tu propio código (por ejemplo, para crear scripts personalizados), puedes instalar los módulos que necesites:

```bash
npm install @gemcheck/domain @gemcheck/application
```

```typescript
import { GitAnalyzerService } from '@gemcheck/application';
// ... usar el servicio en tu código
```

## Primeros Pasos para Contribuir

Si quieres descargar el código fuente y modificar Gemcheck, sigue estos pasos:

### Requisitos Previos
* Node.js (v18 o superior)
* pnpm (v8 o superior)

### Instalación local para desarrollo

1. Clona el repositorio e instala las dependencias:
   ```bash
   pnpm install
   ```
2. Construye todos los paquetes internos:
   ```bash
   pnpm build
   ```
3. Ejecuta la herramienta para ver la ayuda y los comandos disponibles:
   ```bash
   pnpm start
   ```

## Desarrollo y Contribución

Si quieres ayudar a mejorar Gemcheck, ten en cuenta nuestras reglas de arquitectura:
1. El paquete `domain` no debe tener dependencias externas.
2. El paquete `application` solo depende de `domain`.
3. El paquete `infrastructure` implementa lo que `domain` necesita usando herramientas de terceros.

Para ejecutar las pruebas en todos los paquetes:
```bash
pnpm test
```

---
<div align="center">
  <small>Desarrollado para hacer que la calidad del código sea accesible y amigable.</small>
</div>
