# Vivexa Tech Admin Panel

A fully professional, enterprise-grade, modern and responsive Admin Panel for Vivexa Tech built with React, Firebase, and Cloudinary.

## Features

- 🔐 **Secure Authentication** - Google Sign-In only with Firestore-based access control
- 📊 **Analytics Dashboard** - KPI cards, charts, and real-time data visualization
- 👥 **Client Management** - Complete CRUD operations for client data
- 💰 **Billing & Invoicing** - Generate and download PDF invoices
- 🎨 **Portfolio Management** - Upload and manage portfolio items with Cloudinary
- 🏆 **Intern Certificate Management** - Manage certificates with manual ID assignment
- 👤 **User Management** - Super Admin can manage users and access control
- 🌓 **Dark/Light Mode** - Toggle between themes with persistent preference
- 📱 **Fully Responsive** - Works seamlessly on all devices

## Tech Stack

- **React** (Create React App)
- **Bootstrap 5** + Custom CSS
- **Firebase Authentication** (Google Sign-In)
- **Firestore** (Database)
- **Cloudinary** (Image Uploads)
- **Chart.js** (Analytics Charts)
- **React Router DOM** (Routing)
- **Context API** (State Management)
- **jsPDF** (PDF Generation)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase project with Firestore enabled
- Cloudinary account

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd adminpanel
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id

REACT_APP_CLOUDINARY_UPLOAD_URL=https://api.cloudinary.com/v1_1/your_cloud_name/image/upload
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_PORTFOLIO_PRESET=your_portfolio_preset
REACT_APP_CLOUDINARY_CERTIFICATE_PRESET=your_certificate_preset

REACT_APP_SUPER_ADMIN_EMAIL=vivexatech@gmail.com
```

4. Set up Firebase Security Rules (see Firebase Configuration section)

5. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Firebase Configuration

### Authentication
- Enable Google Sign-In provider in Firebase Console
- Add authorized domains

### Firestore Collections

The app uses the following collections:

- **users** - User management (document ID = uid)
- **clients** - Client information
- **sales** - Sales records
- **invoices** - Invoice data
- **portfolio** - Portfolio items
- **intern-certificates** - Internship certificates

### Security Rules

Apply the following Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSuperAdmin() {
      return request.auth != null &&
      request.auth.token.email == 'vivexatech@gmail.com';
    }

    function isAdminUser() {
      return request.auth != null &&
      exists(/databases/$(database)/documents/users/$(request.auth.uid));
    }

    match /users/{docId} {
      allow read, write: if isSuperAdmin();
    }

    match /portfolio/{docId} {
      allow read: if true;
      allow write: if isSuperAdmin();
    }

    match /intern-certificates/{docId} {
      allow read: if true;
      allow write: if isSuperAdmin();
    }

    match /clients/{docId},
          /sales/{docId},
          /invoices/{docId} {
      allow read, write: if isAdminUser();
    }
  }
}
```

## Cloudinary Setup

1. Create a Cloudinary account
2. Create upload presets:
   - `vivexa_img` for portfolio images
   - `intern_certificates` for certificate images
3. Set presets to "Unsigned" for direct uploads
4. Add your Cloudinary credentials to `.env`

## Access Control

- **Super Admin**: `vivexatech@gmail.com` - Full access including user management
- **Admin/Staff**: Users added by Super Admin with `isActive: true` in Firestore
- Users must sign in with Google and have an active record in the `users` collection

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   ├── Clients/
│   ├── Dashboard/
│   ├── Invoices/
│   ├── Layout/
│   ├── Portfolio/
│   ├── Certificates/
│   └── Users/
├── contexts/
│   ├── AuthContext.js
│   └── ThemeContext.js
├── firebase/
│   └── config.js
├── pages/
│   ├── Dashboard.js
│   ├── Clients.js
│   ├── Invoices.js
│   ├── Portfolio.js
│   ├── Certificates.js
│   └── Users.js
├── utils/
│   ├── cloudinary.js
│   └── pdfGenerator.js
├── App.js
└── index.js
```

## Features in Detail

### Dashboard
- Real-time KPI cards (Total Clients, Sales, Profit)
- Revenue distribution pie chart
- Monthly sales bar chart
- Profit growth line chart
- Recent invoices table

### Client Management
- Add, edit, and delete clients
- View client sales history
- Auto-calculate total business

### Invoicing
- Create invoices with multiple services
- Automatic invoice number generation
- Tax calculation
- PDF download functionality

### Portfolio Management
- Upload portfolio items with images
- Cloudinary integration for image storage
- Tag management
- Live URL links

### Certificate Management
- Manual Certificate ID entry (used for public verification)
- Unique ID validation
- Certificate image upload
- Complete certificate information management

### User Management (Super Admin Only)
- Add/edit users
- Activate/deactivate user access
- Role-based access control (admin/staff)

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Environment Variables

All sensitive configuration is stored in `.env` file. Never commit this file to version control.

## Support

For issues or questions, please contact the development team.

## License

Proprietary - Vivexa Tech
