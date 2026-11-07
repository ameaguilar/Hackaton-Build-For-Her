# Cuidados — coordinación familiar para adultos mayores

Demo funcional construida a partir de un prototipo de Figma Make.
React 19 + Vite + Tailwind 4 + TypeScript. Los datos se guardan en el
dispositivo (localStorage), sin backend ni cuentas.

## Cómo correr

```powershell
npm install
npm run dev
```

y abrir **http://localhost:8443/** (el config de Figma fija ese puerto).

Otros comandos: `npm run build` (compilación de producción), `npm run preview`,
`tsc --noEmit` (verificación de tipos), `npm run format`.

## Estructura

```
src/
├─ App.tsx            Navegación entre pantallas + toast
├─ types.ts           Screen (rutas), PatientId
├─ components/        Icon, Button, IconButton, FormField, ActionSheet,
│                     ConfirmDialog, Avatar, TopBar, BottomNav
├─ screens/           Home, CalendarView, NeedsView, Logbook, Notes, Points,
│                     Profile, Admin, Family, Emergency, UtilityScreen
├─ data/              seed.ts (datos iniciales), patients.ts (perfiles)
└─ lib/               storage.ts (persistencia), dates.ts (fechas locales)
```

## Datos en el dispositivo

Todas las claves viven en localStorage con prefijo `cuidados:v1:`
 entradas de bitácora, notas, necesidades, puntos y su historial,
pacientes creados, contactos de emergencia, tareas completadas y
selección de paciente. Las claves versionadas permitirán migrar datos
cuando exista backend.

Para volver a los datos de ejemplo iniciales: **Mi perfil → Reiniciar
datos de la demo** (o borrar el prefijo `cuidados:v1:` en DevTools).

## Probar en un teléfono real

1. Averigua la IP local de la PC (Windows: `ipconfig` → IPv4).
2. Con la PC y el teléfono en la misma red WiFi, abre en el navegador
   del teléfono: `http://<IP-de-la-PC>:8443/`.
3. Los datos se guardan en el dispositivo que estés usando (cada uno
   tiene su propio localStorage).

## Limitaciones (por diseño, en esta etapa)

- Sin backend: los datos no se sincronizan entre dispositivos.
- Sin sesiones ni roles: la app simula ser "Ana" (cuidadora principal).
- Sin notificaciones reales: los avisos son toasts locales que no se
  envían a nadie más.
