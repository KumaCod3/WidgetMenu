# WidgetMenu

A dedicated backend aggregator and API service built with **Node.js** and **Express**. It connects to the databases of other applications (like `AppPromemoria` and `AppSpazzatura`) to serve a unified JSON response. This is perfectly designed to be consumed by external frontends, such as Android widgets or apps.

---

## 📋 Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Endpoints](#endpoints)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)

---

## ✨ Features
- 🔄 **Data Aggregation**: Fetches and combines data from different MongoDB instances.
- 🌐 **JSON API**: Exposes clean JSON responses containing reminders, waste schedules, and the menu.
- 📱 **Frontend Ready**: Built specifically to feed data to client applications (like Android widgets).
- 🐳 **Dockerized**: Includes a Dockerfile and docker-compose.yml for quick, orchestrated deployment.

## ⚙️ Prerequisites
Before running this project, ensure you have installed:
* **Node.js** (v14.x or higher recommended)
* **npm** (comes bundled with Node.js)
* **Docker & Docker Compose** (Optional, for containerized running)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/KumaCod3/WidgetMenu.git
cd WidgetMenu
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
The application needs to know the addresses of the databases from the other apps.
1. Locate the file named `Example.env` in the root directory.
2. Rename it to `.env`:
```bash
mv Example.env .env
```
3. Open the new `.env` file and set the required URIs and port:
```env
PORT=4000
PROMEMORIA_MONGO_URI=mongodb://...
SPAZZATURA_MONGO_URI=mongodb://...
```

---

## ⚙️ Configuration

Since this is an aggregator, make sure that the MongoDB instances for `AppPromemoria` and `AppSpazzatura` are running and accessible from where this backend is hosted.

---

## 🛠️ Running the Application

### Using Node.js
To start the server, simply run:
```bash
node index.js
```

The JSON response can be fetched at: **`http://localhost:PORT/`** (or the specific route set in your files).

### Using Docker Compose
If you want to spin it up with Docker:
```bash
docker-compose up -d
```

---

## 📂 Project Structure
```text
├── .dockerignore        # Files to ignore in the Docker image
├── .gitignore           # Files to ignore in Git
├── Dockerfile           # Docker configuration for containerization
├── Example.env          # Example environment variables (needs renaming)
├── docker-compose.yml   # Orchestration for running the container easily
├── index.js             # Main API entry point and routes
├── noDBand roidMenu.js  # Dedicated logic/fallback for the menu or Android specific setups
└── package.json         # Project metadata and dependencies
```

## 💻 Technologies Used
* **Node.js**: JavaScript runtime environment.
* **Express.js**: Web framework to create the API.
* **MongoDB & Mongoose**: Used to connect and read data from existing databases.
* **Docker**: For containerization and easy shipping.

---
*Maintained by [KumaCod3](https://github.com/KumaCod3)*