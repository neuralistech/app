# Neuralis Web — Corporate Site

Web corporativa de **Neuralis Technologies** — BPO, Call Center & Transformación Digital.

## Stack

- [Remix](https://remix.run/) — framework web full-stack
- [Framer Motion](https://www.framer.com/motion/) — animaciones
- [Three.js](https://threejs.org/) — 3D hero sphere
- CSS Modules — estilos con variables CSS

## Desarrollo local

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:7777](http://localhost:7777).

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `SESSION_SECRET` | Secreto para cookies de sesión (tema claro/oscuro) |
| `FORMSPREE_ENDPOINT` | URL del formulario Formspree para contacto |

## Deploy

La app se despliega automáticamente en **Vercel** al hacer push a `main`.

Domain: [www.neuralistech.com](https://www.neuralistech.com)
