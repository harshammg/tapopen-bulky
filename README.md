# bulky by tapopen

[![GitHub repo](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/harshammg/tapopen-bulky)

A sleek, local-first WhatsApp bulk messaging tool. Plan, personalize, and safely dispatch human-paced outreach campaigns directly from your browser without complex cloud setups or paid subscriptions.

## Overview

**bulky by tapopen** is a powerful personal outreach suite for WhatsApp. Simply connect your WhatsApp Web session locally, upload a CSV or Excel file of contacts, and compose personalized messages using dynamic variables. Built with safety in mind, it sends messages in human-paced batches with randomized delays to keep your account secure and prevent automated flags.

## Key Features

* **Local-First Architecture:** Runs entirely on your local machine. No third-party servers parse your contacts or messages.
* **Direct WhatsApp Integration:** Authenticates directly with your own WhatsApp Web session via a local QR code.
* **Dynamic Personalization:** Inject custom variables from your uploaded contact list directly into your message templates (e.g., {{Name}}, {{Company}}).
* **Human-Paced Sending:** Configure custom batch sizes and delays between messages to mimic human behavior and protect your account from spam filters.
* **Live Campaign Monitoring:** View real-time logs of messages being sent, successful deliveries, and any failures.
* **Persistent History:** Your campaign configurations, contact lists, and message drafts are saved locally in your browser for seamless continuation.

## Technology Stack

* **Frontend:** React 19, Vite, Tailwind CSS v4, Framer Motion, TanStack Router
* **Backend:** Express, Socket.io, whatsapp-web.js
* **Package Manager:** npm

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

* Node.js (v18 or higher recommended)
* npm (Node Package Manager)

## Installation

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/harshammg/tapopen-bulky.git
   cd tapopen-bulky
   ```

2. Install the required dependencies using npm:
   ```bash
   npm install
   ```

## Usage

The application requires both the backend and frontend development servers to be running simultaneously.

1. **Start the backend server:**
   Open a terminal window and run:
   ```bash
   npm run dev:backend
   ```
   This will start the Express server and the WhatsApp Web client on port 3001.

2. **Start the frontend server:**
   Open a second terminal window and run:
   ```bash
   npm run dev
   ```
   This will start the Vite development server, typically accessible at http://localhost:5173.

3. **Connect WhatsApp:**
   Open the frontend URL in your browser. Navigate to the Campaign Builder, click "Connect WhatsApp", and scan the generated QR code using the WhatsApp application on your phone (Linked Devices).

## Contributing

We are open to contributors! If you have ideas for new features, bug fixes, or improvements, feel free to open an issue or submit a pull request on our [GitHub repository](https://github.com/harshammg/tapopen-bulky).

## Important Disclaimer

This application uses `whatsapp-web.js` to interface with WhatsApp. Automated or bulk messaging is strictly against WhatsApp's Terms of Service. This tool is intended for personal, consent-based outreach to known contacts. Using this tool to send unsolicited spam or mass marketing campaigns will likely result in a permanent ban of your WhatsApp account. The developers of this tool assume no liability for account suspensions or bans. Use at your own risk.

## License

This project is licensed under the MIT License.
