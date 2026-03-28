import app from './app.js';
import env from './config/env.js';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`
  ⛳ GolfDraw API Server
  ─────────────────────────
  Port:        ${PORT}
  Environment: ${env.NODE_ENV}
  Frontend:    ${env.FRONTEND_URL}
  ─────────────────────────
  `);
});
