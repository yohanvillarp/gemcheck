<div align="center">
  <h1>Gemcheck CLI</h1>
  <p><strong>Tu asistente de línea de comandos para cuidar la salud de tu código.</strong></p>
  
  <p>
    <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React" /></a>
    <a href="https://www.npmjs.com/package/@nikelyh/gemcheck"><img src="https://img.shields.io/npm/v/@nikelyh/gemcheck.svg?style=flat-square" alt="NPM Version" /></a>
  </p>
</div>

---

Gemcheck es una herramienta amigable que te ayuda a evaluar y mejorar la calidad de tus proyectos hechos en Node.js. En lugar de tener que revisar el código a mano, Gemcheck automatiza el proceso para que puedas detectar problemas a tiempo, como archivos que cambian demasiado, cuellos de botella en el equipo y dependencias ocultas.

## Instalación

Puedes usar Gemcheck instantáneamente sin necesidad de instalar nada globalmente mediante `npx`:

```bash
npx @nikelyh/gemcheck scan
```

Si prefieres tenerlo disponible en tu sistema en todo momento, puedes instalarlo globalmente:

```bash
npm install -g @nikelyh/gemcheck
```

## Uso

Una vez instalado, navega a cualquier directorio de tus proyectos en la terminal y ejecuta los comandos:

```bash
# Para ejecutar un escaneo rápido del historial git
gemcheck scan

# Para analizar la complejidad ciclomática mediante AST
gemcheck complexity --path <directorio>

# Para intentar corregir automáticamente problemas detectados
gemcheck fix

# Para abrir el panel de control (Dashboard Neo-Brutalista) interactivo
gemcheck config --ui

# Para ver la ayuda completa y la lista de comandos
gemcheck --help
```

## Funcionalidades Principales

* **Análisis Evolutivo de Git**: Detecta archivos problemáticos (Hotspots), concentración de conocimiento (Bus Factor) y código acoplado (Acoplamiento Lógico).
* **Análisis Estático Local y AST**: Cálculo de complejidad ciclomática/cognitiva mediante análisis estructural del código fuente.
* **Triaje y Auto-fix**: Resolución automática de problemas (ej. *magic numbers*) utilizando `jscodeshift` integrado.
* **Panel Visual (Neo-Brutalista)**: Una interfaz gráfica vibrante, rápida e intuitiva que se levanta directamente desde tu consola para revisar métricas.

## Acerca de este paquete

Este paquete contiene el binario principal (`cli`) de Gemcheck. Para ver la documentación completa de desarrollo, el código fuente y las guías de contribución, visita el repositorio oficial en GitHub: [yohanvillarp/gemcheck](https://github.com/yohanvillarp/gemcheck).
