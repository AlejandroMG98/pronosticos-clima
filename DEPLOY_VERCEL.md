## Pasos para Desplegar

### 1. Crear cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "Sign Up"
3. Selecciona "Continue with GitHub"
4. Autorizar Vercel

### 2. Importar Proyecto

1. En el dashboard de Vercel, darle clic en **"Add New..."** y luego **"Project"**
2. Seleccionar repositorio: **usuario/nombre-proyecto**
3. darle clic en **"Import"**

### 3. Configurar el Deploy

Vercel automáticamente lo detecta. Configura:

**Framework Preset:** `Angular`

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```bash
dist/nombre-proyecto/browser
```

**Install Command:**
```bash
npm install
```

### 4. Deploy

1. Darle clic en **"Deploy"**
2. Esperar ...

## URL de la Aplicación

Vercel proporciona una url:
```
https://nombre-proyecto.vercel.app
```

## Deploy Automático

Cada vez que se haga push a la rama `dev` o `main`, Vercel desplegará automáticamente.

```bash
git add .
git commit -m "Actualización de Aplicativo."
git push
```

## Configuración Adicional (Opcional)

### Crear archivo `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/nombre-proyecto/browser",
  "framework": "angular",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Esto asegura que las rutas de Angular funcionen correctamente.
