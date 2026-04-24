# Deploy en Netlify (Next fullstack + TiDB)

## 1) Crear el sitio en Netlify

1. `Add new site` -> `Import an existing project`
2. Elegir el repo `control-stock-portfolio`
3. Build command: `npm run build`
4. Publish directory: dejar vacio (Netlify detecta Next)

## 2) Variables de entorno en Netlify

Cargar en `Site configuration` -> `Environment variables`:

- `DATABASE_URL` (con `?sslaccept=strict` para TiDB)
- `DB_HOST`
- `DB_PORT=4000`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_PERSONAL_NAME` (si usas la misma base, igual a `DB_NAME`)
- `DB_SSL=true`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL=https://<tu-sitio>.netlify.app`
- `NEXT_PUBLIC_BASE_PATH=`
- `FIRST_ADMIN_USER` (opcional, solo primer arranque)
- `FIRST_ADMIN_PASSWORD` (opcional, solo primer arranque)

## 3) Desplegar en Netlify

Disparar el deploy desde Netlify UI (o push a la rama conectada).

## 4) Migraciones (fuera del build)

No correr migraciones dentro del build de Netlify. Ejecutarlas aparte:

```bash
npm run db:migrate:deploy
```

Si queres crear admin inicial desde tu maquina con las mismas vars:

```bash
npm run db:create-first-admin
```

## 5) Verificacion

1. Abrir `https://<tu-sitio>.netlify.app/login`
2. Iniciar sesion con el admin
3. Probar endpoints (`/api/me`, `/api/login`)

## 6) Seguridad despues del primer login

Eliminar `FIRST_ADMIN_PASSWORD` de variables en Netlify una vez creado el usuario admin.
