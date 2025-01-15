Giyapay QR is a standalone service for seamless QR-based payment management. Designed with a role-based system, it ensures smooth operations with real-time updates, payment tracking, and user management features.
This document outlines features, technologies, user flow, and deployment details.

Key Features

Dashboards
-------------
Role-specific dashboards provide access to relevant features and data:

Admin Dashboard:
-------------
Overview of:
Total users.
Total branches.
Total QR codes created under the merchant account.
Manage Co-Admins and Branch Users (CRUD operations).
Batch upload functionality to add users and branches via an Excel file.
Access payment statuses and after-sales requests.

Co-Admin Dashboard:
-----------------------
Overview of:
Total users under assigned branches.
Total branches managed.
View, filter, and print transaction details.
Access payment statuses and after-sales requests.
Branch User Dashboard:
Generate QR codes for branch-specific payments.
Monitor payment statuses in real-time.
Super Admin Dashboard:
Create Admin accounts with merchant details.
View the list of all Admin users.
User Roles and Responsibilities

Super Admin:
-----------------------------------
Create Admin accounts with merchant details.
View the list of all Admin users.
Admin:
Manage Co-Admins and Branch Users with Branch (CRUD operations).
Handle batch uploads for users and branches.
Oversee QR code management and payment statuses for all branches.
Co-Admin:
View, filter, and print transaction details.
Monitor payment statuses.

Branch User:
-------------------------
Generate QR codes for branch-specific payments.
Monitor payment statuses in real-time.

Universal Profile Page
--------------------------------
Accessible to Admin, Co-Admin, and Branch Users (not available for Super Admin).
Displays user-specific information:
Name, email, role, branch (if applicable).

After-Sales Request Form
----------------------------
Accessible to Admin, Co-Admin, and Branch Users.
Submit requests for post-payment assistance, such as refunds or transaction issues.

Batch Upload Functionality
-----------------------------
Admin can bulk-upload users or branches using an Excel file.
The system validates the file for errors before processing.
Enables efficient user and branch management.

Technologies Used
=====================
Frontend
-----------
React.js: User interface.
Material UI (MUI): Modern design components.
Vite: Fast development server.
Socket.IO Client: Real-time updates.

Backend
--------------------
Node.js & Express.js: Server-side logic.
Sequelize ORM: Database management.
MySQL: Data storage.
Socket.IO: Real-time communication.
JWT Authentication: Secure login and session management.
Hosting





















User Flow
Simplified User Flow Diagram

+-------------------+                          +-------------------+
|   Super Admin     |                          |    End User       |
| Creates Admin     |                          |                   |
+-------------------+                          +-------------------+
         |                                            |
         v                                            v
+-------------------+                          +-------------------+
|      Admin        |                          | Scans QR Code     |
| CRUD Co-Admins/   | ------------------------>|                   |
| Branch Users      |                          +-------------------+
+-------------------+                                   |
         |                                              v
         v                                                  +-------------------------------+
+-------------------+                   | Redirects to GiyaPay Gateway |
|     Co-Admin      |                   +-------------------------------+
| View/Print        |                             |
| Transactions      | <--------------------------+
+-------------------+   Real-Time Payment Status Updates
         |
         v
+-------------------+
|   Branch User     |
| Generate QR Codes |
| & View Payments   |
+-------------------+




How to Start the System
Frontend
Clone the repository:

git clone https://github.com/tamimhossain11/giyapay_qr.git

cd frontend
Install dependencies:

npm install

Start the development server:

npm run dev

Access the application at http://localhost:5173
Backend
Clone the repository:

git clone https://github.com/tamimhossain11/giyapay_qr.git

cd backend
Install dependencies:

npm install

Start the server:

npm start

The server runs at http://localhost:3000.

Deployment
Frontend
Hosted on Vercel.
Backend
Deployed on Google Cloud Platform (GCP).

FAQs
Q1: Who can generate QR codes?
Only Branch Users can generate QR codes for branch-specific payments.
Q2: Can Co-Admins manage QR codes?
No, Co-Admins can only view, filter, and print transaction details for their assigned branches.
Q3: How are payment statuses updated?
Payment statuses are updated in real-time using Socket.IO and visible to Admin, Co-Admin, and Branch Users.

