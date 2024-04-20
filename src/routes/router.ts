import { Router } from 'express';
import { ItemsController } from '../controllers/';
import { Pool } from 'pg';
import 'dotenv/config';

const router = Router();

export const pool = new Pool({
    user: process.env.DBUSER,
    host: process.env.DBHOST,
    database: process.env.DATABASE,
    password: process.env.DBPASS,
    port: process.env.DBPORT ? parseInt(process.env.DBPORT, 10) : undefined,
}); 

pool.on('error', (err, client) => {
    console.error('Unexpected error: ', err);
    process.exit(-1);
});

const itemsController = new ItemsController();

router.get('/items', itemsController.getItems);
router.post('/balance', async (req, res) => { //TODO In case of further development we can move it to a separate controller as we've done with items endpoint
    const { userId, amount } = req.body;
    if (isNaN(userId) || isNaN(amount) || amount <= 0) {
        return res.status(400).send('Invalid request data');
    }

    try {
        const client = await pool.connect();
        const result = await client.query(
            'UPDATE users SET balance = balance - $1 WHERE id = $2 AND balance >= $1 RETURNING *',
            [amount, userId]
        );

        if (result.rowCount === 0) {
            return res.status(400).send('User not found or insufficient balance');
        }

        res.json({ message: 'Balance updated successfully', user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating balance');
    }
});

export default router;