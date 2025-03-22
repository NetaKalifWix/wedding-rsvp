# **Twilio RSVP System**

## **Prerequisites**

### **1. Twilio Account Setup**

To use this system, you need an **active Twilio account and phone number**. If you don’t have one, you can follow these steps:

1. Sign up at [Twilio](https://www.twilio.com/) and create an account.
2. Obtain the following credentials from your Twilio dashboard:
   - **Account SID**
   - **Auth Token**
   - **Twilio Phone Number**

> **Note:** If you're using Twilio's free trial, you can test the system, but for real use, you'll need to purchase credits. A rough estimate is **3 SMS per guest** (RSVP request, confirmation, and thank-you message).

---

### **2. Database Setup**

This project requires a **MySQL database**. You can use any MySQL provider; in this example, `sql12.freesqldatabase.com` is used.

**Required database credentials:**

- **Host**
- **Username**
- **Password**
- **Database name**
- **Port**

---

### **3. Environment Variables**

#### **Server Configuration (`./Server/.env`)**

Create a `.env` file inside the `Server` directory and add the following details:

```plaintext
DB_EXTERNAL_HOST=
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE_NAME=
DB_PORT=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

#### **Client Configuration (`./Client/.env`)**

Create a `.env` file inside the `Client` directory and add:

```plaintext
SERVER_URL=
```

- If running locally: `http://localhost:<your-server-port>`
- If deployed: Use your server’s external URL

---

### **4. Twilio Webhook Configuration**

To enable Twilio to receive and respond to SMS messages, configure your Twilio phone number to direct messages to your server.

1. Log in to your **Twilio account**.
2. Navigate to:  
   **Twilio Sidebar → Develop Tab → Phone Numbers → Manage → Active Numbers**
3. Select your Twilio number.
4. Scroll to **Messaging Configuration**.
5. Under **"A Message Comes In"**, select **Webhook** and set the URL to:
   ```
   <your-server-url>/sms
   ```
6. Set **HTTP Method** to **POST**.

---

### **5. Local Development (Using ngrok for SMS Forwarding)**

If running locally, you need to expose your server to the internet using [ngrok](https://ngrok.com/):

1. Install ngrok:
   - [MacOS Setup Guide](https://dashboard.ngrok.com/get-started/setup/macos)
2. Run ngrok to create a public URL:
   ```sh
   ngrok http <your-server-port>
   ```
3. Use the generated **ngrok URL** as your **server URL** in Twilio’s webhook settings.

---

## **Installation & Running the Project**

### **1. Start the Server**

Navigate to the `Server` directory and install dependencies:

```sh
cd Server
npm install
npm run start   # or node index.js
```

### **2. Start the Client**

Navigate to the `Client` directory and install dependencies:

```sh
cd Client
npm install
npm start
```
