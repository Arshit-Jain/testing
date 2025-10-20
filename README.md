# AI Research Assistant

A sophisticated AI-powered research assistant that leverages both ChatGPT (OpenAI) and Gemini (Google) to provide comprehensive research reports. The application features user authentication, chat management, and intelligent research workflows with clarifying questions.

## 🚀 Features

- **Dual AI Integration**: Combines ChatGPT and Gemini for comprehensive research
- **User Authentication**: Secure login and registration system
- **Chat Management**: Create, manage, and organize multiple research conversations
- **Intelligent Research Flow**: 
  - Initial topic submission
  - Clarifying questions to refine research scope
  - Dual AI research generation
  - Email report delivery
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Live polling for research progress
- **Daily Limits**: Free tier with 5 chats per day, premium options available

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework**: React 19 with Vite for fast development
- **Routing**: React Router DOM for navigation
- **State Management**: Custom hooks (`useAuth`, `useChat`, `useUI`)
- **Styling**: CSS modules with responsive design
- **HTTP Client**: Axios with interceptors for authentication

### Backend Integration
- **API Base**: RESTful API with JWT authentication
- **AI Services**: OpenAI ChatGPT and Google Gemini integration
- **Database**: Chat and user data persistence
- **Email Service**: PDF report delivery system

## 📁 Project Structure

```
cd/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── AuthWrapper.jsx
│   │   │   ├── ChatApp.jsx
│   │   │   ├── ChatInput.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── Registration.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useAuth.js    # Authentication logic
│   │   │   ├── useChat.js    # Chat management
│   │   │   └── useUI.js      # UI state management
│   │   ├── pages/            # Page components
│   │   │   ├── ChatPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegistrationPage.jsx
│   │   ├── services/         # API services
│   │   │   └── api.js        # HTTP client and API calls
│   │   └── App.jsx           # Main application component
│   ├── package.json
│   └── vite.config.js
└── package.json              # Root dependencies
```

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - UI framework
- **Vite 7.1.7** - Build tool and dev server
- **React Router DOM 7.9.4** - Client-side routing
- **Axios 1.12.2** - HTTP client
- **React Icons 5.5.0** - Icon library

### Development Tools
- **ESLint 9.36.0** - Code linting
- **SWC** - Fast compilation

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API server running (see backend documentation)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cd
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the `client` directory:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   cd client
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Production Build

```bash
cd client
npm install
npm run dev
```

## 🔧 Configuration

### Environment Variables
- `VITE_API_URL`: Backend API URL (default: `http://localhost:3000`)

### Vercel Deployment
The project includes `vercel.json` configuration for easy deployment to Vercel:
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite
- SPA routing support

## 📱 Usage

### 1. Authentication
- **Registration**: Create a new account with username, email, and password
- **Login**: Sign in with your credentials
- **Auto-login**: Stay logged in across browser sessions

### 2. Research Workflow
1. **Start Research**: Type your research topic in the chat input
2. **Clarifying Questions**: Answer follow-up questions to refine your research scope
3. **AI Processing**: The system generates research using both ChatGPT and Gemini
4. **Report Generation**: Receive comprehensive research reports
5. **Email Delivery**: Get your research report as a PDF via email

### 3. Chat Management
- **New Chat**: Start fresh research conversations
- **Chat History**: Access previous research sessions
- **Sidebar Navigation**: Switch between different chats
- **Mobile Support**: Responsive design for mobile devices

## 🔐 Authentication Flow

The application uses JWT-based authentication:

1. **Login/Registration**: Credentials sent to backend
2. **Token Storage**: JWT stored in localStorage
3. **Auto-attachment**: Token automatically added to API requests
4. **Token Validation**: Backend validates token on each request
5. **Auto-logout**: Token cleared on 401 responses

## 🎯 Key Features Explained

### Dual AI Research
- **ChatGPT Integration**: OpenAI's GPT models for research
- **Gemini Integration**: Google's Gemini for additional insights
- **Combined Reports**: Both AI outputs presented together
- **Real-time Updates**: Live polling for research progress

### Intelligent Research Flow
1. **Topic Submission**: User provides initial research topic
2. **Question Generation**: AI generates clarifying questions
3. **Answer Collection**: User answers questions to refine scope
4. **Research Execution**: Both AIs generate comprehensive reports
5. **Report Delivery**: Final report sent via email as PDF

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Collapsible Sidebar**: Space-efficient navigation
- **Touch-Friendly**: Mobile-optimized interactions
- **Cross-Platform**: Works on all modern browsers

## 🔧 Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Code Structure
- **Components**: Reusable UI components
- **Hooks**: Custom React hooks for state management
- **Services**: API communication layer
- **Pages**: Route-level components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs

## 🔮 Future Enhancements

- [ ] Real-time collaboration
- [ ] Advanced research templates
- [ ] Export options (PDF, Word, etc.)
- [ ] Research analytics
- [ ] Team workspaces
- [ ] API rate limiting improvements
- [ ] Offline support
