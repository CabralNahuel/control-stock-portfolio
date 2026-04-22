# Despliegue a producción (Linux + MySQL)

**Seguro para Git:** este archivo solo tiene ejemplos (placeholders). No incluyas contraseñas ni URLs reales aquí; los datos sensibles van solo en `.env` (que no se sube).

## Checklist antes de subir

- [ ] `.env` no está en el repo (está en `.gitignore`)
- [ ] Variables en `.env.example` documentadas
- [ ] `npm run build` pasa sin errores en local
- [ ] Base MySQL creada en el servidor (vacía; sin seeds)

---

## Pasos en el servidor Linux

### 1. Instalar Node.js (LTS 20 recomendado)

```bash
# Ejemplo con NodeSource (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Clonar el repo

```bash
git clone https://github.com/CabralNahuel/ControlStock.git
cd ControlStock
```

### 3. Instalar dependencias

```bash
npm install
# o: pnpm install
```

### 4. Configurar variables de entorno

```bash
cp .env.example .env
nano .env   # o vim / el editor que uses
```

Completar en **producción**:

- `DB_HOST` → IP o hostname del MySQL (ej. `127.0.0.1` si está en el mismo servidor)
- `DB_USER` → usuario MySQL con permisos sobre la base
- `DB_PASSWORD` → contraseña de ese usuario
- `DB_NAME` → nombre de la base (ej. `control_stock_db`)
- `DB_PORT` → `3306` (o el que use tu MySQL)
- `DB_PERSONAL_NAME` → mismo nombre que `DB_NAME` si usás una sola base
- `DATABASE_URL` → `mysql://DB_USER:DB_PASSWORD@DB_HOST:DB_PORT/DB_NAME`
- `AUTH_SECRET` → secreto para firmar JWTs (obligatorio si usás app móvil con token). Ej: `openssl rand -base64 32`
- `NEXT_PUBLIC_APP_URL` → URL pública con la que van a entrar (ej. `https://tudominio.com`)

### 5. Crear la base de datos en MySQL

En MySQL (o con phpMyAdmin / cliente que uses):

```sql
CREATE DATABASE control_stock_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'control_stock_user'@'%' IDENTIFIED BY 'tu_password_seguro';
GRANT ALL PRIVILEGES ON control_stock_db.* TO 'control_stock_user'@'%';
FLUSH PRIVILEGES;
```

(Ajustá nombre de base, usuario y contraseña a lo que pusiste en `.env`.)

### 6. Aplicar migraciones (tablas)

```bash
npx prisma migrate deploy
```

Esto crea/actualiza todas las tablas. No hace falta `prisma generate` para que la app corra (la app usa `mysql2` directo).

### 7. Crear el primer usuario (admin)

La app exige estar logueado para crear usuarios, así que el **primer usuario** hay que crearlo a mano en la base.

Opción A – desde MySQL, con contraseña hasheada (reemplazá `TU_PASSWORD_HASH` por el hash bcrypt de la contraseña que quieras):

```sql
INSERT INTO Usuario (nombre, password, rol, createdAt)
VALUES ('admin', 'TU_PASSWORD_HASH', 'ADMIN', NOW());
```

Para generar el hash en Node (en el servidor, una sola vez):

```bash
node -e "const bcrypt=require('bcrypt'); bcrypt.hash('LaContraseñaQueQuieras', 10).then(h=>console.log(h));"
```

Copiá el resultado y usalo en el `INSERT` arriba.

Opción B – script incluido (crea usuario `admin` con contraseña `admin123` si no hay usuarios):

```bash
node --env-file=.env scripts/create-first-admin.mjs
# O con nombre y contraseña custom:
node --env-file=.env scripts/create-first-admin.mjs miadmin mipassword123
```

(En Node &lt; 20, cargá antes las variables: `export $(cat .env | xargs)` y luego ejecutá el script.)

### 8. Build de Next.js

```bash
npm run build
```

Genera la carpeta `.next` (no se sube a Git; se genera en el servidor).

### 9. Arrancar la app

**Prueba rápida:**

```bash
npm run start
```

Debería quedar escuchando en el puerto 3000. Probá desde el navegador o con `curl`.

**Para dejarla siempre corriendo (systemd):**

```bash
sudo nano /etc/systemd/system/control-stock.service
```

Contenido (ajustá rutas y usuario):

```ini
[Unit]
Description=Control Stock Next.js
After=network.target

[Service]
Type=simple
User=tu_usuario_linux
WorkingDirectory=/ruta/completa/a/ControlStock
ExecStart=/usr/bin/node node_modules/next/dist/bin/next start -p 3000
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Luego:

```bash
sudo systemctl daemon-reload
sudo systemctl enable control-stock
sudo systemctl start control-stock
sudo systemctl status control-stock
```

### 10. Nginx como reverse proxy (recomendado)

Para usar dominio y HTTPS (puerto 80/443) y que Nginx reenvíe a tu app en el 3000:

```nginx
server {
    listen 80;
    server_name tudominio.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Después podés usar Certbot para HTTPS:

```bash
sudo certbot --nginx -d tudominio.com
```

Y en `.env` poné `NEXT_PUBLIC_APP_URL=https://tudominio.com`.

---

## Resumen rápido (sin Nginx ni systemd)

```bash
git clone https://github.com/CabralNahuel/ControlStock.git && cd ControlStock
npm install
cp .env.example .env && nano .env
# Crear base y usuario en MySQL
npx prisma migrate deploy
# Crear primer usuario admin (INSERT o script)
npm run build
npm run start
```

No hace falta subir el build a ningún lado: el build se hace **en el servidor** después de clonar y configurar `.env`. Los datos reales se cargan desde la app en producción (y el primer usuario como en el paso 7).

---

## APK / app móvil que use este backend

Para tener una app Android (APK) que use la misma base de datos y lógica:

### Opción A – WebView (rápido)

Una app que solo abre la web en un WebView apuntando a tu URL de producción (`https://tudominio.com`). El usuario entra a `/login`, usa stock, etc. como en el navegador. La sesión va por cookies igual que en la web.

- **Qué hacer:** proyecto Android (o React Native / Expo con WebView) que cargue `NEXT_PUBLIC_APP_URL`.
- **Backend:** no cambia nada; ya está listo.
- **Ventaja:** un solo código (el de Next.js). **Desventaja:** no es app “nativa” (menús, gestos, notificaciones push son más limitados).

### Opción B – App nativa que llama a la API (implementado)

El backend ya acepta **token JWT** además de la cookie. La web sigue usando cookie; la app móvil usa el token.

#### Backend (ya está listo)

- **`.env`:** agregar `AUTH_SECRET` (ej. `openssl rand -base64 32`). Sin esto, el login con token falla.
- **Login con token:**  
  `POST /api/login` con body:
  ```json
  { "usuario": "nombre", "password": "clave", "returnToken": true }
  ```
  Respuesta 200:
  ```json
  { "ok": true, "token": "eyJ...", "user": { "id": 1, "nombre": "admin", "rol": "ADMIN" } }
  ```
- **Rutas protegidas:** en cada request a la API (excepto login), enviar el token en la cabecera:
  ```
  Authorization: Bearer <token>
  ```
  Las rutas que usan `getCurrentUser()` (ej. `/api/me`, `/api/admin/usuarios`, stock, etc.) aceptan cookie **o** Bearer token.
- **Token:** JWT con vigencia 7 días. Cuando expire, la app debe volver a hacer login y guardar el nuevo token.

#### App móvil (qué tenés que hacer)

1. **Base URL:** configurar la URL del backend (ej. `https://tudominio.com`). No hardcodear si tenés dev/prod.
2. **Login:**  
   `POST {baseUrl}/api/login` con `{ usuario, password, returnToken: true }`.  
   Guardar en seguro (Keychain/Keystore o equivalente) `token` y opcionalmente `user`.
3. **Llamadas a la API:** en cada request a `{baseUrl}/api/...` agregar la cabecera:
   `Authorization: Bearer <token>`.
4. **Si recibís 401:** borrar token y redirigir a login (el token puede haber expirado).
5. **Endpoints útiles:**  
   - `GET /api/me` → usuario actual (`{ id, nombre, rol }`).  
   - Las mismas rutas que usa la web: stock, compras, retiros, alertas; usuarios y reset/delete solo para ADMIN (según rol).
6. **HTTPS:** en producción el servidor debe tener SSL; Android puede rechazar HTTP.
7. **APK:** generar con Expo (`eas build -p android`), React Native o Flutter; el binario es la APK.

Resumen: **Opción A** = WebView que abre tu web; **Opción B** = app que habla con la API usando el token (ya implementado en el backend).

---

## Cómo generar la APK y pasarla al celular

La app web (Next.js) no “se convierte” en APK: tenés que crear un **proyecto móvil** que o bien abre tu web (WebView) o bien llama a la API. Abajo: opción rápida (WebView) y opción con app nativa (Expo).

### Opción rápida: APK que abre tu web (WebView con Expo)

En ~10 minutos tenés un APK que al abrirlo muestra tu sitio (login, stock, etc.) como si fuera una app.

1. **Instalar Expo CLI y crear proyecto**
   ```bash
   npx create-expo-app@latest control-stock-app --template blank
   cd control-stock-app
   ```

2. **Instalar WebView**
   ```bash
   npx expo install react-native-webview
   ```

3. **Cambiar el contenido de `App.js`** (o `App.tsx`) por algo así:
   ```javascript
   import { StatusBar } from 'expo-status-bar';
   import { SafeAreaView, StyleSheet } from 'react-native';
   import { WebView } from 'react-native-webview';

   const URL = 'https://tudominio.com';  // tu backend en producción

   export default function App() {
     return (
       <SafeAreaView style={StyleSheet.absoluteFillObject}>
         <StatusBar style="auto" />
         <WebView
           source={{ uri: URL }}
           style={StyleSheet.absoluteFillObject}
           sharedCookiesEnabled
           javaScriptEnabled
         />
       </SafeAreaView>
     );
   }
   ```
   Reemplazá `https://tudominio.com` por tu URL real (con HTTPS).

4. **Build de la APK con EAS (Expo Application Services)**
   ```bash
   npx eas-cli login    # cuenta Expo, es gratis
   npx eas build -p android --profile preview
   ```
   Te pregunta si querés configurar EAS: aceptá. Al terminar, EAS te da un **enlace para descargar el APK**.

5. **Pasar la APK al celular**
   - Descargá el APK desde ese enlace (en la PC o directo en el celular).
   - En el celular: abrí el archivo y permití “Instalar desde fuentes desconocidas” si Android lo pide.
   - Instalá y abrí la app: va a cargar tu web.

**Nota:** Si tu backend todavía está en `http://...`, en Android 9+ puede bloquearse. Usá HTTPS en producción (Certbot + Nginx como en el paso 10 del deploy).

---

### Opción app nativa (Expo) que llama a la API

Acá la app no es un WebView: son pantallas hechas en React Native que llaman a tu API con el token.

1. **Crear proyecto**
   ```bash
   npx create-expo-app@latest control-stock-mobile --template blank
   cd control-stock-mobile
   ```

2. **Pantallas:** Login (POST `/api/login` con `returnToken: true`), guardar token, y luego todas las llamadas con `Authorization: Bearer <token>`. Podés reutilizar la lógica de la web pero con componentes de React Native (no Next.js).

3. **Build APK**
   ```bash
   npx eas build -p android --profile preview
   ```

4. **Descargar e instalar** el APK desde el enlace que te da EAS, igual que arriba.

---

### Resumen

| Qué querés | Cómo |
|------------|------|
| APK rápido que sea “la web en el celular” | WebView (Expo + `react-native-webview`) apuntando a tu URL. |
| APK “app nativa” que use la API | Proyecto Expo/React Native con login por token y pantallas que llaman a `/api/...`. |
| Pasar la APK al celular | Descargar el APK desde el enlace de EAS (o enviarlo por mail/Drive) e instalar en el teléfono; permitir “fuentes desconocidas” si hace falta. |
