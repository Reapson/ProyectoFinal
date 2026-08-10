# Guion de Demo - Semana 15

## 1. Login

Mostrar el inicio de sesión.

Explicar:

"El sistema utiliza autenticación JWT para identificar al usuario y proteger los endpoints que requieren autenticación."

---

## 2. Landing Page

Mostrar los elementos obtenidos desde las fuentes.

Explicar:

"Los elementos son obtenidos mediante la API y mostrados en la interfaz."

---

## 3. Guardar elemento

Seleccionar un elemento y utilizar la opción de guardar.

Explicar:

"Los usuarios autenticados pueden guardar elementos para posteriormente consultarlos, descargarlos y analizarlos."

---

## 4. Download / Upload

Descargar un elemento en formato JSON.

Después utilizar la opción de Upload para cargar el archivo.

Explicar:

"El sistema permite exportar elementos en formato JSON y posteriormente importarlos utilizando multipart/form-data."

---

## 5. Configuración

Ingresar como administrador.

Mostrar:

- Usuarios.
- Roles.
- Asignación de roles.
- Eliminación de roles.
- Secrets.

Explicar:

"Las funciones administrativas están protegidas mediante autorización por roles."

---

## 6. Elemento Sorpresa - Tendencias

Abrir el widget de Tendencias.

Mostrar:

- Noticias analizadas.
- Temas del momento.
- Frecuencia de palabras.
- Sentimiento positivo.
- Sentimiento negativo.
- Sentimiento neutral.

Explicar:

"Esta es la funcionalidad de Elemento Sorpresa. El frontend consume el endpoint GET /api/trending."

---

## 7. Backend de Tendencias

Abrir Swagger.

Ejecutar:

GET /api/trending

Mostrar la respuesta JSON.

Explicar:

"El backend analiza los SourceItems guardados, extrae las palabras clave más frecuentes y realiza una clasificación básica de sentimiento."

---

## 8. Código de Tendencias

Mostrar brevemente:

```text
Controllers/TrendingController.cs
Services/Trending/TagExtractionService.cs
DTOs/Trending/
wwwroot/index.html
wwwroot/css/style.css
wwwroot/js/trending.js