# Accounts Management Desktop Application

An offline desktop application for managing accounts, stock, and customers built with Electron.js, HTML, Tailwind CSS, and JavaScript.

## Features

- Dashboard with financial charts
- Stock management with summary and detailed views
- Customer management with transaction history
- Local database storage
- PDF generation
- Backup and restore functionality
- Works completely offline

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd accounts-desktop-app
```

2. Install dependencies:
```bash
npm install
```

3. Download required assets:
```bash
node download-assets.js
```

## Running the Application

To start the application in development mode:
```bash
npm start
```

## Building the Application

To build the application for your platform:
```bash
npm run build
```

The built application will be available in the `dist` directory.

## Project Structure

```
accounts-desktop-app/
├── assets/
│   ├── css/
│   ├── js/
│   └── fonts/
├── main.js
├── app.js
├── index.html
├── package.json
└── README.md
```

## Database

The application uses SQLite for local data storage. The database file is stored in the user's application data directory.

## License

ISC #   a c c o u n t s e l e c t r o n a p p  
 