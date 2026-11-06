# Frontend del sistema de taller mecánico

Aplicación Angular 14 para consumir la API REST del Proyecto II. Incluye inicio de
sesión, navegación según rol, órdenes de trabajo, diagnósticos, reparaciones,
vehículos, clientes, facturación con detalle, movimientos y consumo de repuestos,
administración de usuarios, catálogos, roles y permisos.

## Requisitos

- Node.js y npm
- .NET SDK requerido por el backend
- MySQL/MariaDB con la base `proyecto_2_desarrollo_web`

## Iniciar el proyecto

1. Configura la conexión a MySQL y la clave JWT en el backend. No publiques esos
   valores en el repositorio.
2. Inicia el backend desde su carpeta con `dotnet run --launch-profile https`.
   El perfil local escucha en `https://localhost:7073`; acepta CORS desde
   `http://localhost:4200`.
3. En esta carpeta instala dependencias con `npm ci`.
4. Ejecuta `npm start` y abre `http://localhost:4200/`.

La URL base de la API está en `src/environments/environment.ts`. Para otro
servidor, actualiza `apiBaseUrl` en los archivos de entorno antes de compilar.

> El archivo `db.txt` del backend elimina y vuelve a crear tablas. No lo ejecutes
> sobre una base existente sin respaldo.

## Verificación

- `npm test -- --watch=false --browsers=ChromeHeadless`
- `npm run build`

La interfaz requiere que la API y la base de datos estén disponibles para
autenticarse y cargar datos. Los roles y permisos se administran desde las
secciones de administración; los permisos pueden asignarse a roles y activarse o
desactivarse.
Los usuarios se crean y administran desde la sección correspondiente; facturas e
inventario requieren los permisos de rol descritos en el menú de navegación.
