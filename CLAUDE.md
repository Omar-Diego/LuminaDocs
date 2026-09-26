@AGENTS.md

# Lumina — Documentación (Astro + Starlight)

Este repo es el sitio de documentación de **Lumina**, la plataforma de gestión de tutorías presenciales (requerimientos, metodología y arquitectura en `src/content/docs/`). La demo funcional vive en el repo hermano `app/` (Next.js).

## Herramientas y flujo de trabajo obligatorio

- **/graphify**: usar siempre para entender el código, la estructura de contenido o relaciones entre archivos antes de explorar manualmente. Ahorra tokens y va construyendo el grafo de conocimiento ("el cerebro") del proyecto — mantenlo actualizado.
- **/ponytail:ponytail**: usar para cualquier cambio de código o configuración (agregar, refactorizar, arreglar, revisar). Prioriza siempre la solución más simple, corta y mínima que funcione.
- **/ui-ux-pro-max:brand**: usar para cualquier cambio de UI/UX o de voz de marca en el sitio de documentación. Siempre en conjunto con [`DESIGN.md`](./DESIGN.md) (raíz de este repo) como fuente de verdad de colores, tipografía, espaciado y componentes.
- **/find-docs**: usar para consultar documentación pesada de librerías/frameworks (Astro, Starlight, etc.) en vez de confiar en conocimiento entrenado que puede estar desactualizado.

## Diseño

El sistema de diseño de referencia es [`DESIGN.md`](./DESIGN.md) — el mismo que usa el repo `app/`, para mantener consistencia visual entre la documentación y la demo.

## Commits

- Usar **Conventional Commits** (`feat:`, `fix:`, `refactor:`, etc.) para el mensaje del commit.
- No agregar a Claude como coautor ni colaborador (sin `Co-Authored-By`).
- Commitear solo los archivos relevantes al cambio solicitado; dejar intactos otros cambios pendientes no relacionados en el working tree.
