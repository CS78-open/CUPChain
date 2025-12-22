# CUPChain - Healthcare Waiting List Blockchain Demo

**CUPChain** is a Proof of Concept (PoC) web application designed to demonstrate how blockchain technology can ensure transparency, immutability, and efficiency in managing healthcare waiting lists.

## 🏥 App Functionality

The application simulates a decentralized ledger for tracking medical prescriptions from booking to delivery.

### 1. Patient Portal (Reservation)
*   **Function**: Allows users to register a medical exam request using their Fiscal Code and NRE (Electronic Prescription Number).
*   **Blockchain Action**: Creates a **"CREATION"** block. The data is hashed and added to the chain, effectively "booking" the slot in an immutable registry.

### 2. Hospital Portal (Management)
*   **Function**: Displays a real-time list of pending requests that have been recorded on the blockchain but not yet fulfilled.
*   **Blockchain Action**: When a doctor "Fulfills" a request, a **"FULFILLMENT"** block is mined and added to the chain, cryptographically linked to the previous history. This ensures the path from request to service delivery is traceable.

### 3. Public Ledger (Transparency)
*   **Visualizer**: Shows every block in the chain with its index, timestamp, validator ID, and SHA-256 hashes.
*   **Integrity Check**: The app automatically validates the chain. If data is tampered with, the cryptographic links break, and the system alerts the user.
*   **AI Auditor**: Uses **Google Gemini AI** to analyze the blockchain data. It reads the ledger history to provide a professional audit report on wait times, efficiency, and potential anomalies.

## 🛠 Tech Stack

*   **Frontend**: React (TypeScript), Tailwind CSS.
*   **Blockchain Logic**: Custom implementation using the browser's native Web Crypto API (`crypto.subtle.digest`) for SHA-256 hashing.
*   **AI Integration**: `@google/genai` SDK for connecting to Gemini models.

## 🚀 How to Run Locally

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Configure API Key**:
    *   Create a file named `.env` in the root folder.
    *   Add your Gemini API Key: `API_KEY=your_google_api_key_here`
    *   *(Note: The `.env` file is ignored by git to protect your key)*

3.  **Start App**:
    ```bash
    npm run dev
    ```

---
*This is a demonstration project running entirely in the browser using LocalStorage. It does not connect to a real blockchain network.*
