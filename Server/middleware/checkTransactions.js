import cron from "node-cron";
import axios from "axios";
import CryptoJS from "crypto-js";
import models from "../model/index.js"; // Import models

const { QrCode, Admin } = models; // Destructure models
const MAX_RETRIES = 10; // Maximum retry count

// Function to generate transaction check signature
const generateCheckTransactionSignature = (merchantID, invoice_number, timestamp, nonce, merchantSecret) => {
  const myStringForHashing = `${merchantID}${invoice_number}${timestamp}${nonce}${merchantSecret}`;
  return CryptoJS.SHA512(myStringForHashing).toString(CryptoJS.enc.Hex);
};

// Function to check pending transactions
const checkTransactions = async () => {
  try {
    const transactions = await QrCode.findAll({
      where: { status: "pending" }, // Fetch only pending transactions
      include: [{ model: Admin, as: "admin", attributes: ["merchant_id", "merchant_secret", "paymentUrl"] }],
    });

    if (!transactions.length) {
      console.log("No pending transactions to check.");
      return;
    }

    await Promise.all(
      transactions.map(async (transaction) => {
        try {
          if (!transaction.admin) {
            console.warn(`Admin data missing for transaction ${transaction.invoice_number}`);
            return;
          }

          const { invoice_number } = transaction;
          const { merchant_id, merchant_secret, paymentUrl } = transaction.admin;

          if (!merchant_id || !merchant_secret || !paymentUrl) {
            console.warn(`Missing merchant details for transaction ${invoice_number}`);
            return;
          }

          const nonce = Math.random().toString(36).substring(2, 15);
          const timestamp = Math.floor(Date.now() / 1000);
          const signature = generateCheckTransactionSignature(merchant_id, invoice_number, timestamp, nonce, merchant_secret);

          const url = `${paymentUrl}/api/1.0/transaction/${invoice_number}?signature=${signature}&merchantId=${merchant_id}&timestamp=${timestamp}&nonce=${nonce}&secretKey=${merchant_secret}`;

          try {
            // Send GET request to check transaction
            const response = await axios.get(url);

            if (response.data && response.data.data) {
              const { referenceNumber, status, amount } = response.data.data;

              await transaction.update({
                status: status.toLowerCase(), // Normalize status
                payment_reference: referenceNumber, // Update reference number
                amount: parseFloat(amount), // Ensure amount is stored as float
                retry_count: transaction.retry_count + 1, // Increase retry count
              });

              console.log(`✅ Updated transaction ${invoice_number}: Status=${status}, Reference=${referenceNumber}, Amount=${amount}, Retry Count=${transaction.retry_count}`);
            } else {
              console.warn(`⚠️ Unexpected response format for transaction ${invoice_number}`);
            }
          } catch (error) {
            if (error.response && error.response.status === 404) {
              // Increase retry count
              await transaction.update({
                retry_count: transaction.retry_count + 1,
              });

              console.warn(`⚠️ Transaction ${invoice_number} not found (404). Retry ${transaction.retry_count}/${MAX_RETRIES}.`);

              // If max retries reached, mark as expired
              if (transaction.retry_count >= MAX_RETRIES) {
                await transaction.update({
                  status: "expired",
                });
                console.log(`🚫 Transaction ${invoice_number} marked as expired after ${MAX_RETRIES} retries.`);
              }
            } else {
              console.error(`❌ Error processing transaction ${invoice_number}:`, error.message);
            }
          }
        } catch (error) {
          console.error(`❌ Error processing transaction ${transaction.invoice_number}:`, error.message);
        }
      })
    );
  } catch (error) {
    console.error("❌ Error checking transactions:", error.message);
  }
};

// Start the cron job
const transactionCronJob = cron.schedule("*/1 * * * *", () => {
  console.log("🔄 Checking transactions every 1 minute...");
  checkTransactions();
});

// Stop the cron job after 10 minutes
setTimeout(() => {
  console.log("⏳ Stopping transaction checking after 10 minutes.");
  transactionCronJob.stop();
}, 10 * 60 * 1000);

export default checkTransactions;
