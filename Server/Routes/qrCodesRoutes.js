import express from 'express';
import { createQrCode, handleCallback, getAllQrCodes,checkInvoice,getFilteredQrCodes } from '../controller/qrCodesController.js';
import models from '../model/index.js';

const { QrCode } = models;

const router = express.Router();

// Middleware to log incoming requests
router.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    console.log('Request Body:', req.body);
    next();
});

// Routes for QR code management
router.get('/get', (req, res, next) => {
    console.log('GET /get route hit');
    next();
}, getAllQrCodes);

router.post('/create', (req, res, next) => {
    console.log('POST /create route hit');
    next();
}, createQrCode);

// Count
router.get('/count', async (req, res) => {
    console.log('GET /count route hit');
    try {
        const count = await QrCode.count();
        res.json({ Status: true, Result: count });
    } catch (error) {
        console.error('Error counting QR codes:', error);
        res.status(500).json({ Status: false, error: 'Internal server error' });
    }
});

// Callback
const validateCallbackType = (req, res, next) => {
    console.log('Validating callback type:', req.params.callbackType); // Debug log
    const { callbackType } = req.params;
    const validTypes = ['success-callback', 'error-callback', 'cancel-callback'];
    if (!validTypes.includes(callbackType)) {
        console.error('Invalid callback type:', callbackType);
        return res.status(400).json({ error: 'Invalid callback type' });
    }
    next();
};

router.post('/callback/:callbackType', validateCallbackType, (req, res, next) => {
    console.log('POST /callback/:callbackType route hit');
    next();
}, handleCallback);

//check
router.get('/check-invoice/:invoice_number', checkInvoice);
//filter

router.get('/filter', getFilteredQrCodes);

export default router;
