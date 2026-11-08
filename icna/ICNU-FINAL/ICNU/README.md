# icnu

**El cuidado nos conecta.**

Demo local para coordinar el cuidado de adultos mayores con su círculo de apoyo.
Construida con React 19, TypeScript, Vite y Tailwind. Tipografía Inter e iconos Lucide servidos localmente.

## Ejecutar

Requiere Node.js 22.12 o posterior.

```bash
npm ci
npm run dev
```

Abre http://localhost:8443/.

```bash
npx tsc --noEmit
npm run build
npm run preview
```

La compilación estática se genera en `dist/`. La configuración es independiente de Figma.

## Funciones

- Perfil local del cuidador, bienvenida y regreso al perfil guardado.
- Registro, edición y eliminación del listado de pacientes.
- Condiciones médicas, alergias, medicamentos, citas, tareas y contactos de emergencia.
- Bitácora, notas, necesidades y resumen semanal por paciente.
- Selección de periodos de siete días y actividad diaria en el resumen.
- Navegación adaptable a móvil y escritorio.
- Marca icnu, avatares de personas con emojis e ilustración de corazón en Cardiología.

## Datos y límites

La información se guarda en localStorage de este navegador; no se sincroniza entre dispositivos.
No hay autenticación real, backend, notificaciones, pagos ni permisos multiusuario.
El inicio incluye datos de ejemplo. Los roles son descriptivos. El perfil local puede retomarse sin contraseña.
Eliminar un paciente lo oculta del listado; sus registros permanecen hasta reiniciar la demo.
Mi perfil → Reiniciar demo borra todos los datos de la aplicación en este navegador.
Las aportaciones son registros de demostración y no realizan pagos.
Los recursos visuales no representan pacientes ni médicos reales; la ilustración del corazón se generó para esta demo.

## Estructura

- `src/components/`: logo, iconos, avatares, navegación, formularios y modales.
- `src/screens/`: pantallas y flujos de la app.
- `src/lib/`: persistencia, contexto de pacientes, fechas y accesibilidad de modales.
- `src/data/`: modelos y ejemplos iniciales.
- `public/brand/`: logo e isotipo en SVG.
- `public/images/`: ilustración de Cardiología.

## Origen

Esta versión se desarrolló a partir de https://github.com/ameaguilar/Hackaton-Build-For-Her.
Conserva el concepto de coordinación familiar y extiende su funcionalidad y diseño.
