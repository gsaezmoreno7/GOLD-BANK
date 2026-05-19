# Sistema de Gestión Interna - Maestranza R.S SPA

Sistema web modular para el control operativo y financiero de talleres industriales, construido con una arquitectura moderna para asegurar escalabilidad y estabilidad.

## Stack Tecnológico

- **Backend:** Node.js, Express, Prisma ORM, SQLite. Documentación de API mediante Swagger.
- **Frontend:** React, Vite, Tailwind CSS, React Router.

## Requisitos Previos

- Node.js v16+ instalado.
- NPM (viene con Node.js).

## Instalación y Configuración

1. **Clonar/Extraer el proyecto** en tu entorno local.

2. **Configuración Backend:**
   - Navega al directorio backend: `cd backend`
   - Instala las dependencias: `npm install`
   - Genera el cliente de Prisma: `npx prisma generate`
   - Ejecuta las migraciones de la base de datos: `npx prisma db push`
   - Ejecuta el script Seed para cargar el Admin principal: `node seed.js`
   *(Esto creará el usuario Admin: `admin@maestranzars.cl` / `admin123`)*

3. **Configuración Frontend:**
   - Navega al directorio frontend: `cd frontend`
   - Instala las dependencias: `npm install`

## Cómo Ejecutar el Sistema

Puedes usar el archivo `.bat` incluido en la raíz para iniciar ambos servicios simultáneamente:
- Doble click en `start-app.bat`

Opcionalmente, puedes iniciarlos manualmente:
- **Backend:** `cd backend && npm run dev` (Puerto 3001)
- **Frontend:** `cd frontend && npm run dev` (Puerto 5173 normalmente)

## Funcionalidades Principales y Flujo

1. **Autenticación (JWT)**
2. **Dashboard de Métricas y Trabajos**
3. **Gestión de Órdenes de Trabajo** y estados (Diagnóstico, Reparación, Finalizada)
4. **Módulo de Finanzas (Presupuestos, Facturación en PDF y Pagos)**

> **Documentación API:** Cuando el backend esté en ejecución, puedes ver la especificación en Swagger a través de: `http://localhost:3001/api-docs`

## Consideraciones de Arquitectura y Patrones (3FN)
La base de datos fue normalizada correctamente hasta la 3ra Forma Normal (3FN), separando claramente entidades comerciales de entidades de usuarios, evidencia técnica y seguimiento financiero para mantener la trazabilidad completa.
