# ⚽ MatchHub

Το **MatchHub** είναι μια ολοκληρωμένη πλατφόρμα διαχείρισης αθλητικών εγκαταστάσεων και εύρεσης παικτών (Matchmaking). Στόχος είναι να συνδέσει τους ιδιοκτήτες γηπέδων με αθλητές που ψάχνουν χώρο ή αντιπάλους.

## 🚀 Δυνατότητες (Features)

### 👤 Για Αθλητές / Team Managers
* **Εγγραφή & Προφίλ:** Δημιουργία λογαριασμού και διαχείριση προφίλ.
* **Αναζήτηση Γηπέδων:** Εύρεση αθλητικών εγκαταστάσεων με βάση την τοποθεσία και τις παροχές.
* **Online Κράτηση:** Έλεγχος διαθεσιμότητας σε πραγματικό χρόνο και κράτηση γηπέδου.
* **Matchmaking:**
    * Δυνατότητα "Looking for Players" σε μια κράτηση.
    * Αναζήτηση αγώνων που ψάχνουν παίκτες.
    * Αποστολή αιτημάτων συμμετοχής (Join Requests).
* **Ιστορικό:** Προβολή ιστορικού κρατήσεων και αγώνων.

### 🏟️ Για Facility Managers (Ιδιοκτήτες)
* **Διαχείριση Εγκατάστασης:** Πλήρης διαχείριση προφίλ επιχείρησης (Τοποθεσία, Φωτογραφίες, Περιγραφή).
* **Διαχείριση Γηπέδων:** Προσθήκη/Επεξεργασία γηπέδων (Τύπος, Τιμή, Φωτογραφίες).
* **Διαχείριση Κρατήσεων:** Έγκριση ή απόρριψη εισερχόμενων κρατήσεων.
* **Ημερολόγιο:** Επισκόπηση προγράμματος γηπέδων.

### 🛡️ Για διαχειριστές (Admin)
* **Έγκριση Χρηστών:** Έλεγχος και έγκριση νέων Facility Managers (Pending status).
* **Στατιστικά:** Επισκόπηση συνολικών χρηστών, εγκαταστάσεων και κρατήσεων.
* **Διαχείριση Χρηστών:** Πρόσβαση στη λίστα όλων των εγγεγραμμένων χρηστών.

### 📧 Επικοινωνία & Σύστημα Email
* **Φόρμα Επικοινωνίας:** Οι επισκέπτες μπορούν να στέλνουν μηνύματα απευθείας στον διαχειριστή.
* **Ανάκτηση Κωδικού:** Λειτουργία "Ξέχασα τον κωδικό" με αποστολή email επαναφοράς.
* **EJS Templates:** Χρήση προτύπων HTML για επαγγελματική εμφάνιση των emails.

---

## 🛠️ Τεχνολογίες (Tech Stack)

Το project έχει αναπτυχθεί με το **MERN Stack**:

* **Frontend:** React.js, Context API, Bootstrap, Axios.
* **Backend:** Node.js, Express.js, **EJS** (Email Templates), **Nodemailer**.
* **Database:** MongoDB & Mongoose.
* **Authentication:** JWT (JSON Web Tokens).
* **File Uploads:** Multer (Τοπική αποθήκευση εικόνων).
* **Real-time:** Socket.io (Υποδομή για live επικοινωνία).
* **Automation:** Node-Cron (Αυτόματη ολοκλήρωση ληγμένων κρατήσεων).

---
## ⚙️ Εγκατάσταση & Εκτέλεση

### 1. Κλωνοποίηση (Clone)
```bash
git clone https://github.com/likinio365/MatchHub.git
cd MatchHub
```
2. Εγκατάσταση Dependencies

Θα χρειαστεί να κάνετε install τόσο στο  backend όσο και στο φάκελο frontend.
Για το Backend:
```bash
cd backend
npm install
```
Για το Frontend:
```bash
cd frontend
npm install
```
3. Ρύθμιση Environment Variables (.env)

Δημιουργήστε ένα αρχείο .env στον κεντρικό φάκελο backend και προσθέστε τα εξής:
```bash
PORT=5000
MONGO_URI=mongodb+srv://ΤΟ_MONGO_URL_ΣΑΣ
JWT_SECRET=ΤΟ_ΜΥΣΤΙΚΟ_ΣΑΣ_ΚΛΕΙΔΙ
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Ρυθμίσεις Email (Gmail App Password)
EMAIL_USERNAME=το_email_σας@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```
4. Εκτέλεση

Ανοίξτε δύο τερματικά:

Terminal 1 (Backend):
```bash
node server.js
```
Terminal 2 (Frontend):
```bash
cd frontend
npm start
```
Η εφαρμογή θα τρέχει στο http://localhost:3000

## 📡 API Endpoints

### 👤 1. Users (`/api/users`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/` | Εγγραφή νέου χρήστη |
| **POST** | `/login` | Σύνδεση (Login) |
| **POST** | `/forgotpassword` | Αίτημα για reset password |
| **PUT** | `/resetpassword/:resetToken` | Ορισμός νέου κωδικού |
| **GET** | `/profile` | Λήψη στοιχείων συνδεδεμένου χρήστη |

### 🏟️ 2. Facilities (`/api/facilities`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/` | Όλες οι εγκαταστάσεις (Public) |
| **POST** | `/` | Δημιουργία εγκατάστασης |
| **GET** | `/list` | Λίστα για dropdowns (ID & Όνομα) |
| **GET** | `/my-facility` | Η εγκατάσταση του συνδεδεμένου Manager |
| **GET** | `/:id` | Λεπτομέρειες μίας εγκατάστασης |
| **PUT** | `/:id` | Ενημέρωση εγκατάστασης |
| **POST** | `/upload` | Ανέβασμα εικόνας εγκατάστασης |

### ⚽ 3. Fields (`/api/fields`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/` | Όλα τα γήπεδα (με φίλτρα) |
| **POST** | `/` | Δημιουργία γηπέδου (με εικόνα) |
| **GET** | `/my-fields` | Τα γήπεδα του συνδεδεμένου Manager |
| **PUT** | `/:id` | Ενημέρωση γηπέδου |
| **DELETE** | `/:id` | Διαγραφή γηπέδου |
| **PATCH** | `/:id/toggle` | Ενεργοποίηση/Απενεργοποίηση διαθεσιμότητας |

### 📅 4. Bookings (`/api/bookings`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/` | Δημιουργία κράτησης |
| **GET** | `/my-bookings` | Ιστορικό κρατήσεων Team Manager |
| **GET** | `/check-availability/:fieldId/:date` | Έλεγχος διαθέσιμων ωρών |
| **GET** | `/facility-requests` | Αιτήματα προς έγκριση (Manager) |
| **PUT** | `/:id/status` | Έγκριση/Απόρριψη κράτησης |
| **PATCH** | `/:id/players` | Toggle "Ψάχνω παίκτες" |

### 🤝 5. Matches / Matchmaking (`/api/matches`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/open-matches` | Αγώνες που ψάχνουν παίκτες |
| **GET** | `/my-requests` | Αιτήματα που έκανα ως παίκτης |
| **GET** | `/manager/all-requests` | Αιτήματα που έλαβα ως Manager |
| **GET** | `/requests/:bookingId` | Λήψη αιτημάτων για συγκεκριμένο αγώνα |
| **POST** | `/join/:bookingId` | Αίτημα συμμετοχής σε αγώνα |
| **PUT** | `/request/:requestId` | Αποδοχή/Απόρριψη παίκτη |

### 🛡️ 6. Admin (`/api/admin`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/stats` | Στατιστικά πλατφόρμας |
| **GET** | `/users` | Λίστα όλων των χρηστών |
| **GET** | `/pending-users` | Χρήστες που περιμένουν έγκριση |
| **PUT** | `/approve/:id` | Έγκριση χρήστη |
| **DELETE** | `/reject/:id` | Απόρριψη χρήστη |

### 🔔 7. Public & Notifications
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/public/home-stats` | Στατιστικά αρχικής σελίδας |
| **POST** | `/contact` | Φόρμα επικοινωνίας (αποστολή email)|
| **GET** | `/api/notifications` | Οι ειδοποιήσεις μου |
| **PUT** | `/api/notifications/read-all` | Διάβασμα όλων |

📂 Δομή Φακέλων (Folder Structure)
```bash
MatchHub/
├── backend/
│   ├── config/         # Σύνδεση με βάση δεδομένων
│   ├── controllers/    # Λογική της εφαρμογής (Logic)
│   ├── middleware/     # Auth & Error handling
│   ├── models/         # Mongoose Schemas
│   ├── routes/         # API Routes endpoints
│   ├── utils/          # Email sender utility
│   ├── views/          # EJS Templates για Emails
│   ├── uploads/        # Αποθηκευμένες εικόνες
│   └── server.js       # Κεντρικό αρχείο server
│
└── frontend/
    ├── public/
    └── src/
        ├── api/        # Axios & Socket configurations
        ├── assets/     # Εικόνες & λογότυπα
        ├── components/ # Reusable React components
        ├── context/    # Auth Context API
        └── pages/      # Οι σελίδες της εφαρμογής
```
📸 Screenshots

📝 License
Distributed under the MIT License. See LICENSE for more information.
Developed by Vassilis Likollari.
