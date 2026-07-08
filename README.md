# 🎓 Anti-Proxy Student Attendance System

A secure, web-based attendance system utilizing **Multi-Factor Authentication** to eliminate proxy attendance (buddy punching) in educational environments. This project bridges the physical and digital divide by requiring both a physical NFC student ID card and real-time biometric facial recognition.

## 🛠 Tech Stack
* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **APIs:** Web NFC API, `face-api.js` (TensorFlow.js)
* **Backend:** PHP (Server-side logic)
* **Database:** MariaDB/MySQL
* **Infrastructure:** XAMPP (Local Development Server)
* **Security:** Tailscale (IP Whitelisting & Secure Tunneling)

*Note: The `face-api.js` library and required neural network models are pre-packaged within this repository. No external AI downloads are required.*

---

## 📋 System Requirements

### Server (Host PC)
* **XAMPP** (v8.2.x or latest) for Apache, PHP, and MariaDB.
* **Tailscale** for a secure, persistent VPN IP address.

### Client (Scanning Device)
* **Android Smartphone** with NFC capabilities.
* **Google Chrome for Android** (Latest Version). 
  *(Note: iOS/Apple devices are not supported due to Apple's current Web NFC restrictions).*
* Physical **NFC Tags** (NTAG215 or similar) and an app like **NFC Tools** to write NDEF records.

---

## ⚙️ Installation & Setup

### Phase 1: Secure Context Configuration (HTTPS)
The Web NFC and Camera APIs require a strict secure context to function. You must generate an SSL certificate on your PC and use a Chrome workaround on the mobile device to bypass security blocks.

**Step A: Generate SSL Certificate (PC)**
1. Open your XAMPP folder (e.g., `C:\xampp\apache\`).
2. Run `makecert.bat`.
3. When prompted for a domain name, enter your **Tailscale IP address** (e.g., `100.x.x.x`). Press Enter for the rest of the default prompts.

**Step B: Configure XAMPP (PC)**
1. In the XAMPP Control Panel, click **Config** next to Apache and open `httpd.conf`.
2. Remove the `#` before `LoadModule ssl_module modules/mod_ssl.so`.
3. Remove the `#` before `Include conf/extra/httpd-ssl.conf`. Save and close.
4. Open `httpd-ssl.conf`, ensure `DocumentRoot` points to your `htdocs` folder, and save. 
5. Restart the Apache module.

**Step C: Chrome Security Workaround (Android)**
1. Open Google Chrome on your Android device.
2. Navigate to: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
3. Enable the setting and enter your PC's HTTPS Tailscale IP (e.g., `https://100.x.x.x`).
4. Relaunch Chrome.

### Phase 2: Database & File Deployment
1. **Database:** Open `http://localhost/phpmyadmin` on your PC. Create a database named `attendance_db`. Import the `attendance_db.sql` file included in this repository.
2. **Credentials:** Verify that `Backend/connectDB.php` matches your local XAMPP MySQL credentials (default is `root` with no password).
3. **Deployment:** Place the project folder into your XAMPP `htdocs` directory. The structure should look like this:
```text
/htdocs/attendance_system/
   ├── attendance_db.sql
   ├── index.html 
   ├── main.js
   ├── face-api.min.js
   ├── /Backend/
   └── /models/