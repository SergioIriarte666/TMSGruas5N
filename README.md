# TMS Grúas - Sistema de Gestión de Transportes

![TMS Grúas Logo](https://via.placeholder.com/200x80?text=TMS+Gruas)

## Descripción General

TMS Grúas es un sistema completo de gestión de transportes diseñado específicamente para empresas de grúas y servicios de asistencia en carretera. La plataforma permite administrar servicios, clientes, operadores, grúas, facturación, inspecciones y más, todo desde una interfaz moderna y fácil de usar.

## Características Principales

- **Gestión de Servicios**: Creación, asignación y seguimiento de servicios de remolque, asistencia y transporte.
- **Gestión de Clientes**: Base de datos completa de clientes con historial de servicios.
- **Gestión de Flota**: Control de grúas, mantenimientos y documentación.
- **Gestión de Operadores**: Administración de personal, licencias y certificaciones.
- **Facturación**: Generación de facturas, boletas y notas de crédito/débito.
- **Inspecciones**: Formularios digitales para inspección de vehículos.
- **Calendario**: Programación de servicios, mantenimientos y eventos.
- **Reportes**: Informes detallados de operaciones, finanzas y rendimiento.
- **Portal Cliente**: Acceso para clientes para solicitar servicios y ver su historial.
- **Portal Operador**: Acceso para operadores para gestionar sus servicios asignados.
- **Sistema de Alertas**: Notificaciones de vencimientos de documentos y eventos importantes.

## Arquitectura del Sistema

### Tecnologías Utilizadas

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Autenticación**: Supabase Auth
- **Almacenamiento**: Supabase Storage
- **Generación de PDFs**: jsPDF, html2canvas
- **Gráficos**: Recharts
- **Calendario**: FullCalendar
- **Formularios**: React Hook Form, Zod
- **Estado Global**: Zustand
- **Notificaciones**: Sonner

### Estructura de Directorios

```
/
├── public/              # Archivos estáticos
├── src/                 # Código fuente
│   ├── components/      # Componentes React
│   │   ├── auth/        # Componentes de autenticación
│   │   ├── calendario/  # Componentes del calendario
│   │   ├── clientes/    # Componentes de gestión de clientes
│   │   ├── configuracion/ # Componentes de configuración
│   │   ├── dashboard/   # Componentes del dashboard
│   │   ├── facturacion/ # Componentes de facturación
│   │   ├── gruas/       # Componentes de gestión de grúas
│   │   ├── inspecciones/ # Componentes de inspecciones
│   │   ├── layout/      # Componentes de layout
│   │   ├── operadores/  # Componentes de gestión de operadores
│   │   ├── portal-cliente/ # Componentes del portal cliente
│   │   ├── portal-operador/ # Componentes del portal operador
│   │   ├── reportes/    # Componentes de reportes
│   │   ├── servicios/   # Componentes de gestión de servicios
│   │   ├── ui/          # Componentes de UI reutilizables
│   ├── data/            # Datos mock para desarrollo
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilidades y funciones
│   ├── pages/           # Páginas principales
│   ├── services/        # Servicios de API
│   ├── store/           # Estado global (Zustand)
│   ├── types/           # Definiciones de TypeScript
│   ├── App.tsx          # Componente principal
│   ├── main.tsx         # Punto de entrada
├── supabase/            # Configuración de Supabase
│   ├── migrations/      # Migraciones de base de datos
├── .env                 # Variables de entorno (no incluido en el repositorio)
├── package.json         # Dependencias y scripts
├── tsconfig.json        # Configuración de TypeScript
├── vite.config.ts       # Configuración de Vite
```

## Instalación y Configuración

### Requisitos Previos

- Node.js 18.x o superior
- npm 9.x o superior
- Cuenta en Supabase

### Pasos de Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/tms-gruas.git
   cd tms-gruas
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anonima
   ```

4. Ejecutar migraciones de Supabase:
   ```bash
   npx supabase db push
   ```

5. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Estructura de la Base de Datos

### Tablas Principales

- **profiles**: Usuarios del sistema (operadores, administradores, etc.)
- **clients**: Clientes de la empresa
- **tow_trucks**: Grúas y vehículos de la flota
- **services**: Servicios de remolque, asistencia, etc.
- **inspections**: Inspecciones de vehículos
- **invoices**: Facturas emitidas
- **invoice_items**: Ítems de las facturas
- **payments**: Pagos recibidos
- **calendar_events**: Eventos del calendario

### Relaciones Clave

- Un cliente puede tener múltiples servicios
- Un operador puede estar asignado a múltiples servicios
- Una grúa puede estar asignada a múltiples servicios
- Un servicio puede tener una inspección asociada
- Un servicio puede estar asociado a una o más facturas
- Una factura puede tener múltiples ítems y pagos

## Roles de Usuario

El sistema cuenta con los siguientes roles de usuario:

### Administrador
- Acceso completo a todas las funcionalidades del sistema
- Puede crear, editar y eliminar todos los recursos
- Gestiona configuraciones globales y permisos

### Gerente
- Acceso a la mayoría de las funcionalidades
- Puede crear y editar servicios, clientes, operadores y grúas
- Puede ver reportes y facturación
- No puede eliminar recursos críticos ni modificar configuraciones avanzadas

### Operador
- Acceso al portal de operador
- Gestiona sus servicios asignados
- Realiza inspecciones de vehículos
- Actualiza el estado de los servicios

### Supervisor
- Acceso de solo lectura a la mayoría de las funcionalidades
- Puede ver servicios, clientes, operadores y grúas
- Puede generar reportes

### Cliente
- Acceso al portal de cliente
- Puede solicitar nuevos servicios
- Puede ver su historial de servicios y facturas
- Puede actualizar su información de perfil

## Flujos de Trabajo Principales

### Ciclo de Vida de un Servicio

1. **Solicitud**: Un cliente o administrador crea una solicitud de servicio
2. **Asignación**: Se asigna un operador y una grúa al servicio
3. **Ejecución**: El operador realiza el servicio y actualiza su estado
4. **Inspección**: Se completa una inspección del vehículo (opcional)
5. **Finalización**: Se marca el servicio como completado
6. **Facturación**: Se genera una factura para el servicio

### Proceso de Facturación

1. **Selección de Servicios**: Se seleccionan los servicios a facturar
2. **Generación de Factura**: Se crea la factura con los ítems correspondientes
3. **Emisión**: Se emite la factura y se envía al cliente
4. **Seguimiento de Pagos**: Se registran los pagos recibidos
5. **Cierre**: Se marca la factura como pagada cuando se completa el pago

## Sistema de Alertas

El sistema cuenta con un completo sistema de alertas para:

- Vencimiento de licencias de conducir de operadores
- Vencimiento de exámenes ocupacionales y psicosensotécnicos
- Vencimiento de permisos de circulación, SOAP y revisiones técnicas
- Vencimiento de facturas
- Eventos próximos en el calendario

## Guía de Uso

### Acceso al Sistema

1. Accede a la URL del sistema: `https://tmsgruas.com`
2. Ingresa tus credenciales (email y contraseña)
3. Serás dirigido al dashboard correspondiente a tu rol

### Usuarios de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@tmsgruas.com | password123 |
| Gerente | manager@tmsgruas.com | password123 |
| Operador | operator@tmsgruas.com | password123 |
| Supervisor | viewer@tmsgruas.com | password123 |
| Cliente | cliente@tmsgruas.com | password123 |

### Gestión de Servicios

1. Accede a la sección "Servicios" desde el menú lateral
2. Utiliza los filtros para buscar servicios específicos
3. Haz clic en "Nuevo Servicio" para crear un servicio
4. Completa el formulario con los datos del servicio
5. Para editar un servicio, haz clic en el ícono de edición
6. Para ver detalles, haz clic en el ícono de ojo

### Portal Cliente

1. Accede con credenciales de cliente
2. Solicita un nuevo servicio desde la sección "Solicitar"
3. Revisa el historial de servicios en la sección "Servicios"
4. Consulta facturas en la sección "Facturas"
5. Actualiza tu información en la sección "Perfil"

### Portal Operador

1. Accede con credenciales de operador
2. Gestiona el servicio actual desde la sección "Servicio Actual"
3. Actualiza el estado del servicio según avanza
4. Completa inspecciones de vehículos
5. Revisa el historial de servicios completados

## Mantenimiento y Soporte

### Contacto de Soporte

- Email: soporte@tmsgruas.cl
- Teléfono: +56 2 2234 5678
- Horario: Lunes a Viernes, 9:00 a 18:00

### Actualizaciones

El sistema recibe actualizaciones periódicas con nuevas funcionalidades y mejoras. Las actualizaciones se programan fuera del horario laboral para minimizar interrupciones.

## Licencia

© 2024 TMS Grúas. Todos los derechos reservados.
Este software es propiedad de TMS Grúas y su uso está restringido según los términos del acuerdo de licencia.