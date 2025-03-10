import cron from "node-cron";
import axios from "axios";
import CryptoJS from "crypto-js";
import models from "../model/index.js";

const { QrCode, Admin } = models;
const MAX_RETRIES = 30;
const RETRY_INTERVALS = [1, 2, 5, 10, 15, 30];

// Generate transaction check signature
const generateCheckTransactionSignature = (merchantID, invoice_number, timestamp, nonce, merchantSecret) => {
  const myStringForHashing = `${merchantID}${invoice_number}${timestamp}${nonce}${merchantSecret}`;
  return CryptoJS.SHA512(myStringForHashing).toString(CryptoJS.enc.Hex);
};

// Function to check pending transactions
const checkTransactions = async (io) => {
  console.log("Checking transactions...");
  try {
    const transactions = await QrCode.findAll({
      where: { status: "pending" },
      include: [{ model: Admin, as: "admin", attributes: ["merchant_id", "merchant_secret", "paymentUrl"] }],
    });

    if (!transactions.length) {
      console.log("No pending transactions.");
      return;
    }

    await Promise.all(
      transactions.map(async (transaction) => {
        try {
          if (!transaction.admin) {
            console.warn(`Admin data missing for transaction ${transaction.invoice_number}`);
            return;
          }

          const { invoice_number, retry_count } = transaction;
          const { merchant_id, merchant_secret, paymentUrl } = transaction.admin;

          if (!merchant_id || !merchant_secret || !paymentUrl) {
            console.warn(` Missing merchant details for transaction ${invoice_number}`);
            return;
          }

          const nonce = Math.random().toString(36).substring(2, 15);
          const timestamp = Math.floor(Date.now() / 1000);
          const signature = generateCheckTransactionSignature(merchant_id, invoice_number, timestamp, nonce, merchant_secret);

          const url = `${paymentUrl}/api/1.0/transaction/${invoice_number}?signature=${signature}&merchantId=${merchant_id}&timestamp=${timestamp}&nonce=${nonce}&secretKey=${merchant_secret}`;

          // Send GET request to check transaction status
          const response = await axios.get(url);

          if (response.data && response.data.data) {
            const { referenceNumber, status, amount } = response.data.data;

            await transaction.update({
              status: status.toLowerCase(),
              payment_reference: referenceNumber,
              amount: parseFloat(amount),
              retry_count: 0, // Reset retry count on success
            });

            console.log(`Updated transaction ${invoice_number}: Status=${status}, Reference=${referenceNumber}, Amount=${amount}`);

            // Emit real-time event to clients
            if (io) {
              io.emit("transactionUpdated", {
                invoice_number,
                status: status.toLowerCase(),
                referenceNumber,
                amount: parseFloat(amount),
              });
            }
          } else {
            console.warn(`⚠️ Unexpected response format for transaction ${invoice_number}`);
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            const newRetryCount = (transaction.retry_count || 0) + 1;
            const retryInterval = RETRY_INTERVALS[Math.min(newRetryCount, RETRY_INTERVALS.length - 1)];

            // Mark transaction as expired if retry count exceeds MAX_RETRIES
            if (newRetryCount >= MAX_RETRIES) {
              await transaction.update({ status: "expired" });
              console.log(`Transaction ${invoice_number} marked as expired after ${newRetryCount} retries.`);

              // Emit real-time update to clients
              if (io) {
                io.emit("transactionExpired", { invoice_number });
              }
            } else {
              await transaction.update({
                retry_count: newRetryCount,
                next_check_time: new Date(Date.now() + retryInterval * 60 * 1000),
              });

              console.warn(`Transaction ${invoice_number} not found (404). Retry ${newRetryCount}/${MAX_RETRIES} in ${retryInterval} minutes.`);
            }
          } else {
            console.error(`Error processing transaction ${transaction.invoice_number}:`, error.message);
          }
        }
      })
    );
  } catch (error) {
    console.error(" Error checking transactions:", error.message);
  }
};

// **Start cron job to check transactions every 1 minute**
cron.schedule("*/1 * * * *", async () => {
  console.log(" Running scheduled transaction check...");
  await checkTransactions();
});

export default checkTransactions;
