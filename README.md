# Book The Show

A real-time movie/event ticket booking application built with modern web technologies.

## Features

*   **Real-time Seat Locking:** Prevents multiple users from booking the same seat simultaneously using WebSockets (Socket.io).
*   **Payment Integration:** Secure checkout process using Razorpay.
*   **Authentication & Database:** Firebase Authentication and Firestore for secure user management and data storage.
*   **Modern Frontend:** Built with React, Vite, Tailwind CSS, and Zustand for state management.
*   **Robust Backend:** Express.js server handling API requests, payments, and real-time events.

## Tech Stack

*   **Frontend:** React 19, Vite, Tailwind CSS, Zustand, Framer Motion, Recharts
*   **Backend:** Node.js, Express, Socket.io, Razorpay SDK
*   **Database & Auth:** Firebase (Firestore, Auth)
*   **Language:** TypeScript

## Run Locally

**Prerequisites:**
*   Node.js
*   Firebase project
*   Razorpay account

**Setup Instructions:**

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Update the `.env` file with your credentials:
    ```env
    # Razorpay Keys
    RAZORPAY_KEY_ID=your_razorpay_key_id
    RAZORPAY_KEY_SECRET=your_razorpay_key_secret
    ```
    Ensure your Firebase configuration is correctly set up.

3.  **Run the app:**
    ```bash
    npm run dev
    ```
    The application will start the Express backend and Vite frontend development server concurrently.

4.  **Build for Production:**
    ```bash
    npm run build
    ```
