# **SMS RSVP System**

## **Prerequisites**

### **1. sms4free Account Setup**

To use this system, you need an **active sms4free account and phone number**. If you don’t have one, you can follow these steps:

1. Sign up at [sms4free](https://www.sms4free.co.il/) and create an account.

> **Note:** If you're using 10 sms free trial, you can test the system, but for real use, you'll need to purchase credits. A rough estimate is **4 SMS per guest** (RSVP request, confirmation,a day before the wedding and thank-you message).

---

### **2. Database Setup**

This project requires a **Postgres database**. You can use any Postgres provider; in this example, `neon` is used.

neon gives you an url for your db.

---

### **3. Environment Variables**

#### **Server Configuration (`./Server/.env`)**

Create a `.env` file inside the `Server` directory and add the following details:

```plaintext
DATABASE_URL=
SMS_4_FREE_KEY=
SMS_4_FREE_USER=
SMS_4_FREE_SENDER=
SMS_4_FREE_PASS=
```

#### **Client Configuration (`./Client/.env`)**

Create a `.env` file inside the `Client` directory and add:

```plaintext
REACT_APP_SERVER_URL=
REACT_APP_GOOGLE_CLIENT_ID=
REACT_APP_GOOGLE_CLIENT_SECRET=
```

- If running locally: `http://localhost:<your-server-port>`
- If deployed: Use your server’s external URL

---

### **4. sms4free Configuration**

To enable sms4free to receive and respond to SMS messages, configure your phone number to direct messages to your server.

---

### **5. Local Development (Using ngrok for SMS Forwarding)**

If running locally, you need to expose your server to the internet using [ngrok](https://ngrok.com/):

1. Install ngrok:
   - [MacOS Setup Guide](https://dashboard.ngrok.com/get-started/setup/macos)
2. Run ngrok to create a public URL:
   ```sh
   ngrok http <your-server-port>
   ```
3. Use the generated **ngrok URL** as your **server URL** in sms4free settings.

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
