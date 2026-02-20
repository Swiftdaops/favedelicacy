import express from 'express';
import authRoutes from './routes/auth.routes.js';
import brandRoutes from './routes/brand.routes.js';
import foodRoutes from './routes/food.routes.js';
import drinkRoutes from './routes/drink.routes.js';
import categoryRoutes from './routes/category.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import customerRoutes from './routes/customer.routes.js';

const router = express.Router();

router.get('/', (req, res) => res.json({ status: 'backend running' }));

router.use('/auth', authRoutes);
router.use('/brand', brandRoutes);
router.use('/foods', foodRoutes);
router.use('/drinks', drinkRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin/customers', customerRoutes);

export default router;
