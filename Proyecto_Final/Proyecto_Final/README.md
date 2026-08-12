# Proyecto Final - News Aggregator

Sistema web para la gestión, consulta y análisis de contenido proveniente de diferentes fuentes de información.

El proyecto utiliza una API REST desarrollada con ASP.NET Core 8, autenticación mediante JWT, ASP.NET Core Identity, Entity Framework Core y SQL Server. El frontend es HTML/CSS/JavaScript plano, servido como archivos estáticos por la misma aplicación (carpeta `wwwroot`).

---

## Tecnologías utilizadas

- ASP.NET Core 8
- C#
- Entity Framework Core 8
- SQL Server (LocalDB)
- ASP.NET Core Identity
- JWT Authentication
- REST API
- Swagger / OpenAPI
- HTML5
- CSS3
- JavaScript
- Git / GitHub

---

## Requisitos

Para ejecutar el proyecto se necesita:

- .NET 8 SDK
- Visual Studio 2022 o superior
- SQL Server LocalDB
- Git

---

## Clonar el repositorio

```bash
git clone https://github.com/Reapson/ProyectoFinal.git
```

---

## Cómo correr el proyecto

1. Abrir `Proyecto_Final.sln` en Visual Studio (o `Proyecto_Final/Proyecto_Final` en la terminal).
2. Presionar F5 (o `dotnet run` desde la carpeta `Proyecto_Final/Proyecto_Final`).
3. Al iniciar, la aplicación aplica las migraciones de Entity Framework automáticamente y siembra datos de ejemplo: roles (`Admin`, `User`), un usuario administrador y dos fuentes de noticias de demo.
4. El sitio queda disponible en la URL que indique la consola (por ejemplo `http://localhost:5208`). La página principal (`/` o `/index.html`) es la landing page; Swagger está en `/swagger`.

### Credenciales de prueba

- **Email:** `admin@proyectofinal.com`
- **Password:** `Admin123!`

---

## Estructura del frontend (`wwwroot`)

| Página | Descripción |
|---|---|
| `index.html` | Landing page: lista de noticias (guardadas o en vivo), botón guardar, panel de Admin para agregar fuentes, sección de Tendencias. |
| `login.html` / `register.html` | Autenticación de usuarios. |
| `config.html` | Panel de Admin: asignar/quitar roles, gestionar Secrets, descargar/subir items en JSON. |

Todas las páginas consumen la API vía `wwwroot/js/api.js`, que usa una ruta **relativa** (`/api`) para funcionar sin importar el puerto en el que corra la aplicación (misma origin, ya que el frontend lo sirve el propio backend).

---

## Correcciones aplicadas (bug-fixing final antes de la demo)

Tras integrar el trabajo de todo el equipo se hizo una revisión completa y se corrigieron los siguientes problemas:

- **Crítico:** `js/api.js` tenía la URL de la API hardcodeada a `https://localhost:5001/api`, un puerto que no coincide con ningún perfil de `launchSettings.json`. Esto rompía login, registro, landing, guardar, agregar fuente, configuración y download/upload. Se cambió a una ruta relativa (`/api`).
- **Crítico:** `index.html` estaba incompleto: le faltaba el contenedor `#items` (donde se pintan las noticias), las etiquetas `<script>` de `api.js`/`auth.js`/`landing.js`, y el cierre de `</body></html>`. Se completó el archivo.
- `index.html` referenciaba `css/styles.css` (no existe); el archivo real es `css/style.css`. Corregido.
- `config.html` y `config.js` estaban guardados con una codificación distinta a UTF-8, mostrando texto corrupto (`Configuraci�n`, `??`, etc.). Se re-guardaron en UTF-8.
- Se integró la sección de **Tendencias** (Elemento Sorpresa) dentro de `index.html`, que antes no estaba conectada a ninguna página (`js/trending.js` existía pero no se usaba en ningún HTML).
- En `config.js`, la lista de items para descargar ahora filtra únicamente los items realmente guardados en la base de datos (con `id`), evitando un error al intentar descargar un item en vivo sin guardar.
- `login.js` / `register.js` ahora muestran el mensaje de error real que devuelve la API en vez de un mensaje genérico.
