---
title: "Parte 1: Requerimientos y Metodología de Desarrollo"
description: Resumen ejecutivo, requerimientos funcionales y no funcionales, trazabilidad y metodología Scrum del sistema de tutorías.
---

1. Resumen Ejecutivo y Visión del Producto

- Declaración del problema, alcance consolidado y propuesta de valor del sistema

Problema: Estudiantes que necesitan apoyo académico encuentran difícil comparar tutores confiables, materias y horarios en un solo lugar. La coordinación manual aumenta el riesgo de perfiles incompletos y reservas duplicadas.

Visión: Un sistema web para encontrar tutores verificados, consultar disponibilidad y agendar sesiones presenciales con una experiencia clara para estudiantes, tutores y administradores. La propuesta de valor reúne identidad, verificación y agenda trazable en un mismo flujo.

Alcance consolidado: Registro e inicio de sesión, perfil de estudiante y tutor, materias, revisión administrativa, búsqueda y vista del tutor, publicación de franjas, reserva, calendario básico y valoración posterior. La recomendación inicial consiste en ordenar coincidencias de materia y horario. Se excluyen pagos, chat, video, geolocalización y validación externa automatizada. Para menores de edad, el uso real requiere definir consentimiento familiar antes de un lanzamiento.

## Actores y responsabilidades

| Actor         | Objetivo                    | Facultad                                       |
| ------------- | --------------------------- | ---------------------------------------------- |
| Estudiante    | Encontrar y reservar apoyo  | Consulta, reserva y reseña propia              |
| Tutor         | Ofrecer materias y horarios | Edita su perfil y franjas; consulta reservas   |
| Administrador | Mantener confianza          | Aprueba o rechaza perfiles y registra decisión |
| Familia       | Autorizar uso de menores    | Interesado externo; flujo fuera del MVP        |

2. Desglose y Clasificación de Requerimientos

- Requerimientos Funcionales

| ID   | Prioridad | Comportamiento                                                | Aceptación                                                                  |
| ---- | --------- | ------------------------------------------------------------- | --------------------------------------------------------------------------- |
| RF01 | P1        | Estudiante y tutor crean cuenta e inician/cierran sesión.     | La sesión identifica al usuario y bloquea operaciones protegidas al cerrar. |
| RF02 | P1        | Tutor edita perfil y selecciona una o más materias.           | Perfil guarda nombre, descripción y materias; inicia pendiente.             |
| RF03 | P1        | Administrador aprueba o rechaza tutor con motivo.             | Solo aprobados aparecen en búsqueda; se registra actor y fecha.             |
| RF04 | P1        | Buscar tutores por materia y ver ficha.                       | Resultados excluyen pendientes y rechazados.                                |
| RF05 | P1        | Tutor publica franjas futuras sin solapamiento.               | Estudiante consulta horas libres en hora local.                             |
| RF06 | P1        | Estudiante reserva una franja libre de tutor aprobado.        | Una franja admite una reserva activa; conflicto devuelve 409.               |
| RF07 | P2        | Ambas partes consultan sus sesiones próximas.                 | Calendario presenta fecha, tutor/estudiante y estado.                       |
| RF08 | P2        | Estudiante valora sesión completada una vez.                  | Puntuación 1–5 y comentario asociado a su reserva.                          |
| RF09 | P2        | Estudiante edita datos básicos de su perfil.                  | Solo dueño puede guardar sus datos.                                         |
| RF10 | P3        | Ordenar tutores por coincidencia de materia y disponibilidad. | Orden determinista sin motor inteligente.                                   |

- Requerimientos no funcionales

| ID    | Categoría      | Objetivo                                                                                     | Verificación                                                  |
| ----- | -------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| RNF01 | Rendimiento    | 100 usuarios concurrentes; p95 búsqueda <2 s y reserva <3 s.                                 | Ensayo de carga de piloto; meta aún no medida.                |
| RNF02 | Seguridad      | TLS, contraseñas y sesiones gestionadas por Better Auth; rol validado en servidor.           | Pruebas de accesos cruzados y revisión de secretos.           |
| RNF03 | Escalabilidad  | Índices en materia, estado e inicio; despliegue monolítico ampliable.                        | Plan de consulta y prueba al duplicar datos.                  |
| RNF04 | Usabilidad     | Reserva en máximo cuatro acciones desde resultados; errores claros y navegación con teclado. | Prueba guiada con cinco participantes y revisión WCAG básica. |
| RNF05 | Disponibilidad | Objetivo de piloto 99 % mensual; respaldo diario y recuperación documentada.                 | Monitoreo mensual y restauración de prueba.                   |

- Matriz de Trazabilidad

| Requisito | Caso de uso         | Módulo                   |
| --------- | ------------------- | ------------------------ |
| RF01      | CU02 CU03           | Identidad Better Auth    |
| RF02      | CU03                | Perfiles                 |
| RF03      | CU03                | Verificación             |
| RF04      | CU01                | Catálogo                 |
| RF05      | CU01 CU02           | Agenda                   |
| RF06      | CU02                | Reservas                 |
| RF07      | CU02                | Calendario               |
| RF08      | CU04                | Reseñas                  |
| RF09      | CU05                | Perfiles                 |
| RF10      | CU01                | Catálogo                 |
| RNF01     | CU01 CU02           | Infraestructura          |
| RNF02     | CU02 CU03 CU04 CU05 | Identidad y autorización |
| RNF03     | CU01 CU02           | Datos                    |
| RNF04     | CU01 CU02           | Interfaz                 |
| RNF05     | Todos               | Operación                |

CU04 corresponde a valorar una sesión completada; CU05 a editar el perfil del estudiante. Se conservan en trazabilidad aunque los tres casos de uso desarrollados en detalle sean CU01, CU02 y CU03.
Para mas información de los caso de uso a continuación se proporciona una tabla que sirve de resumen.

| ID   | Caso de uso                  | Qué hace                                                                                        |
| ---- | ----------------------------- | ----------------------------------------------------------------------------------------------- |
| CU01 | Buscar tutor por materia     | Filtra tutores aprobados y muestra sus perfiles y horarios libres.                              |
| CU02 | Reservar una franja          | Un estudiante autenticado confirma un horario disponible; el sistema evita reservas duplicadas. |
| CU03 | Verificar perfil de tutor    | Un administrador revisa y aprueba o rechaza el perfil.                                          |
| CU04 | Valorar una sesión           | El estudiante califica y comenta una tutoría completada.                                        |
| CU05 | Editar perfil del estudiante | El estudiante actualiza sus datos básicos.                                                      |

3. Justificación del Modelo de Desarrollo

- Selección del modelo de desarrollo
  Se adopta Scrum ligero con un sprint de cinco días y un tablero Kanban para mostrar el estado de cada tarea. Prácticamente se conserva el modelo Scrum por entregas pequeñas y retroalimentación. Esta semana de inicio sirve para especificar y revisar el MVP, no para afirmar que se implementó o validó todo el producto.

- Definición de Roles de equipo

  A continuación se presenta como se llegarían a asumir los tres roles de Scrum, tal como en un equipo pequeño real:
  | Rol | Responsabilidad | En este proyecto |
  | --------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
  | Product Owner | Prioriza el backlog y valida que el incremento entregue valor a estudiantes y tutores. | Define RF/RNF, prioridad (P1-P3) y criterios de aceptación de la sección 2. |
  | Scrum Master | Facilita el proceso, remueve impedimentos y cuida la cadencia del sprint. | Organiza el tablero Kanban y da seguimiento a las tareas "En progreso". |
  | Equipo de Desarrollo | Diseña, construye y prueba el incremento. | Implementa autenticación, perfiles, verificación, catálogo, agenda y reservas. |

- Artefactos

  | Artefacto       | Descripción                                                                                           |
  | --------------- | ----------------------------------------------------------------------------------------------------- |
  | Product Backlog | Lista de RF/RNF priorizados (sección 2), origen de las historias de usuario de cada sprint.           |
  | Sprint Backlog  | Subconjunto de tareas seleccionadas por sprint, visible como tarjetas en el tablero Kanban.           |
  | Incremento      | Funcionalidad entregable al cierre de cada sprint (por ejemplo, búsqueda y ficha de tutor).           |
  | Tablero Kanban  | Columnas _Por hacer / En progreso / Hecho_ que documentan la gestión visual de tareas de cada sprint. |

  La gestión de tareas del proyecto se llevó en un tablero Kanban en Trello, organizado por sprint (Requerimientos y diseño, Gestión de usuarios, Gestión de tutores, Búsqueda y reservas, Calificaciones, Administración y Pruebas), en línea con las historias de usuario y RF definidos en la sección 2.

  Tablero: [Tutorías Presenciales — MVP académico (21-25 sep 2026)](https://trello.com/invite/b/6ab74b3f29bc46fb489f4d85/ATTI9693bb04abf1dfaee605928e3d909df2EDC21FCE/tutorias-presenciales-mvp-academico-21-25-sep-2026)

  ![Tablero Kanban en Trello](/captura-trello.png)

- Flujo de trabajo
  1. **Planificación de sprint:** se seleccionan historias de usuario del Product Backlog y se dividen en tareas del Sprint Backlog.
  2. **Ejecución:** cada tarea avanza por el tablero Kanban (Por hacer → En progreso → Hecho); al ser un equipo de una persona no hay daily formal, pero el avance se registra diariamente moviendo las tarjetas.
  3. **Revisión de sprint:** se valida el incremento contra los criterios de aceptación de la matriz de requerimientos (sección 2).
  4. **Retrospectiva:** se ajustan prioridades o alcance del siguiente sprint según hallazgos (riesgos detectados, cambios de requerimientos o retroalimentación simulada de usuarios).
