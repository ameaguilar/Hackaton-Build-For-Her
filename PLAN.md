# Plan de trabajo — App de cuidados de adultos mayores (export de Figma Make)

**Objetivo:** convertir el prototipo exportado de Figma en una demo funcional
que corra en el navegador y **guarde los datos en el dispositivo** (localStorage).
**Alcance explícito:** sin backend ni cuentas en esta etapa (los roles
familiar/cuidador/admin quedan como trabajo futuro).

---

## Estado actual (lo que revisé)

| Archivo | Situación |
|---|---|
| `figma/src.zip` | `App.tsx` (~2,500 líneas: todas las pantallas + datos de prueba), `index.css`, `main.tsx` |
| `figma/public.zip` | `favicon.png`, `.gitattributes` |
| `figma/figma.zip` | Scripts/config de Figma (vite.config.ts los importa desde `./.figma/make/site.json`) |
| `figma/package.json` | Vite 8 + React 19 + Tailwind 4 + TypeScript — correcto |
| `figma/index.html` | ⚠️ Placeholders sin rellenar: `lang="<!-- figma:lang -->"`, `<title><!-- figma:title -->` |

Problemas de funcionalidad detectados:
1. Todo el estado es `useState` local → **se pierde al recargar**.
2. Datos de prueba quemados en el código (pacientes José/Elena/Roberto, fechas fijas `2026-11-24`, puntos fijos 840, etc.).
3. Un solo archivo de 80 KB — difícil de mantener y de extender.
4. Navegación casera (historial en `useState`) — sin URLs.
5. Los formularios (bitácora, notas, necesidades, medicamentos, citas) no persisten lo creado.

Pantallas detectadas en `App.tsx`: `home, log, needs, notes, points, profile,
admin, family, emergency, medications, appointments, tasks, caregivers, patient-create`.

---

## Fase 0 — Hacer que corra (½ día)

- [x] Desempaquetar los ZIP dentro de `figma/`:
  - `src.zip` → `figma/src/`
  - `public.zip` → `figma/public/`
  - `figma.zip` → `figma/.figma/` (la ruta que espera `vite.config.ts`)
- [x] Corregir `index.html`: `lang="es"` y título «Cuidados — coordinación familiar».
- [x] `npm install` (nota: `oxfmt` bajado de `^0.76.0` a `^0.75.0` porque la 0.76.0 se publicó hace menos de 7 días y la regla de seguridad `min-release-age=7` del `.npmrc` la bloquea) y `npm run build` en verde.
- [x] Servidor de desarrollo corriendo en `http://localhost:8443/`.

**Criterio de salida:** la app se abre en el navegador y se navega por todas las pantallas.

## Fase 1 — Capa de datos y persistencia (1–2 días)

- [x] `src/data/types.ts` + `src/data/seed.ts`: tipos `LogEntry`, `NoteItem`; semillas con los datos que venían quemados en App.tsx.
- [x] `src/lib/storage.ts`: hook `usePersistentState(key, initial)` (localStorage con claves versionadas `cuidados:v1:*`, sincronizado entre componentes y pestañas).
- [x] Reemplazado el estado local por persistente en: tareas de Inicio, bitácora (entradas + hora/fecha por defecto reales), necesidad reclamada y aportaciones acumuladas, notas (CRUD básico: crear, ver, editar), saldo de puntos (compartido con la barra superior), tareas del perfil del paciente e items completados de pantallas utilitarias (medicamentos, citas, tareas, cuidadores, pacientes).

**Criterio de salida:** crear una entrada/nota, recargar y seguir ahí. ✔ (diseño intacto, `tsc` y `build` en verde)

## Fase 2 — Refactor ligero (1–2 días)

- [x] `src/components/`: `Icon`, `Button`, `IconButton`, `FormField`, `ActionSheet`, `Avatar`, `TopBar`, `BottomNav`. (Toast queda en App.tsx, es solo markup.)
- [x] `src/screens/`: `Home`, `CalendarView`, `NeedsView`, `Logbook` (bitácora + necesidades), `Notes`, `Points`, `Profile`, `Admin`, `Family`, `Emergency`, `UtilityScreen` (medicamentos, citas, tareas, cuidadores, crear paciente). Datos de pacientes en `src/data/patients.ts`, tipos compartidos en `src/types.ts`.
- [x] `App.tsx` queda como navegador de pantallas (~95 líneas, antes ~2,500).
- [x] Verificado tras la extracción: `tsc --noEmit` sin errores, `npm run build` en verde, servidor responde en localhost:8443.

**Criterio de salida:** App.tsx reducido, sin cambios visuales. ✔

## Fase 3 — Comportamiento real por pantalla (3–5 días)

- [x] **Bitácora:** crear entradas reales (hora actual por defecto), eliminar con confirmación; necesario queda editar para fase posterior.
- [x] **Necesidades:** lista dinámica y persistente (semillas: acompañar cita + medicamentos del mes); publicar desde «Pedir apoyo» con tipo real (económica/cita), urgencia y fecha formateada; cada necesidad tiene su propio flujo de reclamar/aportar/progreso; conteo abierto en el tab de la bitácora; eliminar con confirmación; filtros funcionando sobre datos reales.
- [x] **Notas:** crear, ver, editar y eliminar (con confirmación); estados vacíos por filtro.
- [x] **Puntos:** saldo persistido compartido con la barra superior; canjar descuenta y suma movimientos; opciones de «Ganar puntos» suman puntos reales; historial de movimientos recientes en pantalla.
- [x] **Tareas de Inicio:** persistidas (ya en Fase 1).
- [x] **Perfil / Crear paciente:** perfil resuelve pacientes semilla y pacientes creados (datos médicos, médico, teléfono); crear paciente desde el asistente lo agrega al registro y **aparece en el selector de Inicio**; eliminar paciente del registro; selección de paciente persiste entre sesiones.
- [x] **Emergencia:** contactos de emergencia editables (agregar/eliminar con confirmación y llamada `tel:` real).
- [x] **Medicamentos / Citas / Tareas / Cuidadores:** alta, edición y **eliminación con confirmación**; items completados persistidos.
- [x]**Diálogo de confirmación** reutilizable (`ConfirmDialog`) para todas las eliminaciones destructivas.
- [ ] Pendiente para pulir (opcional): editar entradas de bitácora existentes, calendario alimentado por datos reales por día, resumen de Familia derivado de datos.

**Criterio de salida:** recorrer la app completa haciendo altas/bajas/ediciones y que todo sobreviva a un reload. ✔ (verificado con `tsc`, `build` y servidor activo)

## Fase 4 — Calidad y detalles finales (1–2 días)

- [x] Estados vacíos en bitácora (día sin registros), notas por filtro, necesidades por filtro, contactos de emergencia vacíos y movimientos de puntos.
- [x] Validaciones: fechas de citas/necesidades no pueden ser pasadas (`min`), edad 0–120 verificada al continuar, nombre y rol requeridos en el asistente, monto positivo en aportaciones.
- [x] Calendario real: los días registrados, el resumen del mes (días, ánimo frecuente, incidentes, registros) y la racha se calculan de los datos reales de la bitácora; cada entrada ahora tiene fecha y el timeline muestra solo el día seleccionado (con estado vacío).
- [x] Etiquetas de Inicio con datos reales: registros de hoy, próximo medicamento, próxima cita y contador de necesidades abiertas.
- [x] Botón de «reiniciar datos de demo» en Mi perfil (con confirmación) usando `resetAllData()`.
- [x] README con cómo correrlo, estructura, persistencia, cómo probar en teléfono real y limitaciones.
- [ ] Pendiente (manual): prueba visual en un teléfono físico por el usuario.

**Criterio de salida:** demo presentable para mostrar a usuarios reales. ✔

---

## Fuera de alcance en esta etapa (trabajo futuro)

- Backend multiusuario (Supabase/Firebase), cuentas y roles familiar/cuidador/admin.
- Sincronización entre dispositivos y notificaciones.
- Recordatorios de medicamentos (requiere notificaciones push o tiempo en segundo plano).
- Rutas con URLs (react-router) si se desea compartir links a pantallas.

## Riesgos

- `vite.config.ts` de Figma depende de `.figma/make/site.json` — si falla, sustituirlo por un `vite.config.ts` mínimo (react + tailwindcss) conservando el build.
- UnoDrive puede interferir con `node_modules`; si hay problemas, mover el proyecto fuera de OneDrive o excluir la carpeta de sincronización.
