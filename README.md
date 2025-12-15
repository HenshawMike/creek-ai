Creek AI

Creek AI is a modern web application that transforms spoken sermons and lectures into organized, actionable notes using artificial intelligence. Record audio, get AI-powered transcriptions, and automatically generate summarized notes—all in one seamless interface.
✨ Features
🎤 Recording & Processing

    Browser-Based Recording: Record sermons directly in your browser

    AI Transcription: Convert audio to accurate text using advanced speech recognition

    Smart Summarization: Generate structured summaries from transcripts

    Multi-Format Export: Save notes as text or downloadable PDFs

🎨 User Experience

    Dark/Light Mode: Choose your preferred theme

    Responsive Design: Works on desktop, tablet, and mobile devices

    Modern UI: Clean, intuitive interface with smooth animations

    Accessibility First: WCAG AA compliant with keyboard navigation

📁 Note Management

    Save & Organize: Store your processed notes

    Quick Preview: Browse saved notes with previews

    Easy Retrieval: View and manage your sermon collection

🗂️ Project Structure
Pages

    Landing Page (/)

        Welcome screen with hero section

        Feature highlights

        Quick start button

    Recorder Page (/record)

        Audio recording interface with visualizer

        Recording controls (Start/Pause/Stop)

        Generate notes button

    Result Page (/result)

        Tabbed view for transcript and summary

        Save, download, and record another options

        Preview of AI-generated content

    Saved Notes Page (/saved)

        List of all saved notes

        Note preview with metadata

        View and delete functionality

🎨 Design System
Color Themes

Light Mode:

    Primary: #2563EB (Vibrant Blue)

    Background: #FFFFFF (Pure White)

    Text: #0F172A (Dark Charcoal)

Dark Mode:

    Primary: #3B82F6 (Bright Blue)

    Background: #020617 (Deep Navy)

    Text: #F8FAFC (Light Gray)

UI Components

    Buttons: Rounded corners (12px), clear hover states

    Cards: Soft shadows, ample padding (20px)

    Typography: Inter font family for optimal readability

    Layout: Max width 1200px, responsive grid system

🚀 Getting Started
Prerequisites

    Modern web browser with microphone access

    Node.js (for development)

    Firebase project (for authentication and storage)

Installation
bash

# Clone the repository
git clone https://github.com/yourusername/creek-ai.git

# Install dependencies
cd creek-ai
npm install

# Start development server
npm run dev

Environment Variables

Create a .env file in the root directory:
env

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

## Local backend integration

To use the local FastAPI backend for transcription during development, set the frontend environment variable `VITE_API_URL` to point at the backend. You can copy `.env.example` to `.env` and edit the value.

Example:

1. Start backend (from `creek-backend`):

   - Create a virtualenv and install requirements from `creek-backend/requirements.txt`.
   - Run `uvicorn main:app --reload --host 0.0.0.0 --port 8000`.

2. In the frontend root, copy `.env.example` to `.env` and ensure `VITE_API_URL=http://localhost:8000`.

3. Start the frontend dev server (`npm run dev`) and open the recorder page. When you click "Generate Notes" the recorded audio will be uploaded to `POST /api/transcribe` on the configured backend and the result will be shown on the Result page.

Notes:

- The backend in `creek-backend/main.py` currently returns a placeholder transcription. Replace the transcription logic with your model or external service in `transcribe_audio`.
- For production, set proper CORS origins on the backend and secure the endpoints.

🔧 Technical Stack

Frontend:

    React with TypeScript

    Tailwind CSS for styling

    React Router for navigation

    Web Audio API for recording

Backend:

    Firebase Authentication

    Cloud Functions for AI processing

    Firestore Database

AI Services:

    Speech-to-Text transcription

    NLP-based summarization

    Optional: OpenAI or Google Cloud AI

📱 Usage Flow

    Record: Start recording directly in the browser

    Process: Upload audio for AI transcription and summarization

    Review: View both full transcript and AI-generated summary

    Save: Store notes locally or to your account

    Manage: Access saved notes anytime

🔐 Authentication

Creek AI uses Firebase Authentication with:

    Email/password sign-in

    Google OAuth integration

    Protected routes for saved notes

♿ Accessibility

    WCAG AA color contrast compliance

    Full keyboard navigation support

    Screen reader labels and ARIA attributes

    Reduced motion preferences respected

🎯 Future Enhancements

    Real-time transcription during recording

    Multiple language support

    Advanced note editing tools

    Collaboration features for teams

    Mobile app version

    Customizable summary templates

    Integration with sermon libraries

🤝 Contributing

Contributions are welcome! Please read our Contributing Guidelines for details on our code of conduct and the process for submitting pull requests.
📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
🙏 Acknowledgments

    Icons by Lucide React

    UI Components by shadcn/ui

    Fonts by Google Fonts

    Color palette inspired by Tailwind CSS

Creek AI – Transform spoken wisdom into written insight ✍️
