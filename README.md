# 💻 POS Frontend - Interfaz de Usuario

Este es el cliente del Sistema POS Multisucursal, desarrollado en **Angular 17** y optimizado para una experiencia de usuario fluida y profesional.

## ✨ Características Frontend
- **PWA (Progressive Web App)**: Instalable en dispositivos móviles y funcional en condiciones de red inestables.
- **Diseño Premium**: Interfaz limpia, intuitiva y responsive usando Bootstrap y estilos personalizados.
- **Venta Rápida**: Interfaz de punto de venta optimizada para uso con lector de barras.
- **Dashboard de Reportes**: Visualización de ventas y estados de inventario.
- **Gestión de Roles**: Vistas y funcionalidades protegidas mediante Guards de Angular según el rol del usuario.

## 🏗️ Estructura del Proyecto
- `src/app/core/`: Servicios globales, guards e interceptores.
- `src/app/modules/`: Módulos funcionales (POS, Inventory, Admin, etc.).
- `src/app/shared/`: Componentes y pipes reutilizables.
- `src/assets/`: Recursos estáticos e imágenes.

## 🚀 Inicio Rápido
1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar servidor de desarrollo:
   ```bash
   npm start
   ```
3. Abrir navegador en `http://localhost:4200`.

## 🔋 Integración Socket.io
El frontend se conecta automáticamente al backend mediante WebSockets para recibir actualizaciones críticas sobre:
- Cambio en niveles de stock.
- Confirmación de pagos Transbank.
- Alertas de sistema.

---
**Frontend Versión 1.0.0**

