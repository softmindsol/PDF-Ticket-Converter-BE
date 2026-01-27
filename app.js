import express from 'express';
import cors from 'cors';
import { ApiError } from '#utils/api.utils.js';
import router from '#routes/index.js';
import { swaggerServe, swaggerSetup } from '#config/swagger.config.js';

const app = express();

// ONLY use express.json() ONCE, with the desired limit.
app.use(express.json({ limit: '30mb' })); // Changed to '30mb' as per your update.

app.use(express.static('public'));

app.use(
  cors({
    origin: '*', // For development, '*' is fine. For production, specify your frontend's domain.
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    credentials: true,
  }),
);

app.use('/api/doc', swaggerServe, swaggerSetup);
app.use('/api', router);

app.use(async (err, req, res, next) => {
  if (err instanceof ApiError) {
    res.status(err.code).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
    });
  } else {
    console.error('Server Error:', err);
    const status =
      typeof err?.status === 'number' && err.status >= 100 && err.status < 1000
        ? err.status
        : 500;

    res.status(status).json({
      success: false,
      message: err?.message || 'Something went wrong',
    });
  }
});

export { app };
