# Google Sign-In / Client ID

## Pasos en Google Cloud Console

1. Entrá a https://console.cloud.google.com/apis/credentials
2. Creá o seleccioná un **Proyecto**.
3. Botón **+ CREAR CREDENCIALES → ID de cliente de OAuth**.
4. Tipo de aplicación: **Aplicación web**.
5. En **Orígenes de JavaScript autorizados** agregá:
   - `https://TUUSUARIO.github.io`  (el dominio de tu GitHub Pages)
   - `http://localhost` (para probar en local)
   - (si tenés un dominio custom, agregalo también)
6. Creá el Client ID y copiá la string que empieza con `...apps.googleusercontent.com`.

## Pegar el Client ID

En el archivo `assets/script.js`, al inicio:

```js
const GOOGLE_CLIENT_ID = 'TU_CLIENT_ID.apps.googleusercontent.com';
```

## Nota de seguridad

Como GitHub Pages es 100% estático, Google Sign-In se implementa con el flujo
de navegador (GIS), que da un **ID token** válido para la sesión del usuario.
La tienda no recibe la contraseña ni tokens de actualización de Google.
Si más adelante necesitás verificar el token en un servidor (p. ej. compras
reales con entrega en juego), migrá a un backend (opción "Pages + backend
aparte") y validá el token de Google server-side.