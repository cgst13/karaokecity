# GreyKaraoke

A modern, responsive React application for queuing and playing YouTube videos, perfect for Karaoke sessions or shared music queues.

## Features
- **YouTube Search**: Search for any video on YouTube.
- **Queue System**: Add videos to a queue, prevent duplicates, and manage the playlist.
- **Auto-Play**: Automatically plays the next video in the queue.
- **TV Mode**: A focused view for playback.
- **Responsive Design**: Works on desktop and mobile.

## Prerequisites
1. **Node.js**: Ensure you have Node.js installed.
2. **YouTube Data API Key**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project.
   - Enable the **YouTube Data API v3**.
   - Create credentials (API Key).
3. **Google Service Account (for Sheets)**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Enable the **Google Sheets API**.
   - Create a Service Account and download the JSON key.
   - Share your Google Sheet with the Service Account email (Editor access).

## Setup Instructions

### 1. Backend Setup (Server)
The backend proxies requests to YouTube and manages the Google Sheet database.

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   - Open `.env`
   - Add your YouTube API Key: `YOUTUBE_API_KEY=your_key_here`
   - Add your Google Sheet ID: `GOOGLE_SHEET_ID=your_sheet_id`
   - Add your Service Account Email: `GOOGLE_SERVICE_ACCOUNT_EMAIL=...`
   - Add your Private Key: `GOOGLE_PRIVATE_KEY=...`
4. Start the server:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:5000`.

### 2. Frontend Setup (Client)
The frontend is the React application.

1. Navigate to the `client` directory (in a new terminal):
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser at the URL shown (usually `http://localhost:5173`).

## Usage
1. Enter a search term in the search bar.
2. Click "Add to Queue" on videos you want to play.
3. The first video will start playing automatically if nothing is playing.
4. Subsequent videos will be added to the queue and played automatically when the current one ends.
5. Use the "TV Mode" button (top right) to hide the search interface for a cleaner playback experience.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Vite
- **Backend**: Node.js, Express
- **API**: YouTube Data API v3
