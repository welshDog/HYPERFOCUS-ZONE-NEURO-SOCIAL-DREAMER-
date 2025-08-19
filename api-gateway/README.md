# 🌟💎⚡ HyperFocus Zone API Server ⚡💎🌟

## ADHD-Optimized Real-time Collaboration Platform

The backend API server for HyperFocus Zone - a neurodivergent-friendly social platform designed for people with ADHD, autism, and other neurodivergent conditions.

## 🎯 Features

### ✨ Core Functionality
- **JWT Authentication** with refresh tokens
- **Interest Spaces** - Hyperfocus communities
- **Real-time Chat** with ADHD-friendly features
- **Focus Sessions** - Pomodoro with neurodivergent adaptations
- **Body Doubling** - Virtual accountability partnerships
- **Gamification** - Progress tracking and achievements

### 🧠 ADHD-Optimized Features
- **Customizable session lengths** (15-45 minutes)
- **Distraction management** tools and strategies
- **Energy level tracking** and mood monitoring
- **Flow state detection** and encouragement
- **Sensory accommodations** (visual, audio preferences)
- **Executive function support** (task breakdown, reminders)

### 🔄 Real-time Capabilities
- **Socket.IO** for instant communication
- **Focus session synchronization**
- **Live accountability partnerships**
- **Typing indicators** and presence updates
- **Voice message support**
- **WebRTC integration** for video/audio calls

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Redis (optional, for session storage)

### Installation

1. **Clone and navigate to API directory**
   ```bash
   cd HYPERFOCUS-ZONE-NEURO-SOCIAL-DREAMER/api-gateway
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

### 🌐 Server Endpoints

- **API Base**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/health`
- **Focus Sessions Socket**: `http://localhost:5000/focus`
- **Body Doubling Socket**: `http://localhost:5000/body-doubling`
- **Chat Socket**: `http://localhost:5000/chat`

## 📚 API Documentation

### 🔐 Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "neurodivergent_user",
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "neurodivergentProfile": {
    "isNeurodivergent": true,
    "conditions": ["ADHD"],
    "focusPreferences": {
      "preferredSessionLength": 25,
      "backgroundSounds": "brown-noise"
    }
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "rememberMe": true
}
```

#### Get Profile
```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

### 🌟 Interest Spaces Endpoints

#### Get Spaces
```http
GET /api/spaces?category=Technology&search=programming&page=1&limit=20
Authorization: Bearer <jwt_token>
```

#### Create Space
```http
POST /api/spaces
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "ADHD Programmers",
  "description": "A space for neurodivergent developers",
  "category": "Technology",
  "tags": ["programming", "adhd", "coding"],
  "privacy": "public",
  "neurodivergentFriendly": true
}
```

#### Join Space
```http
POST /api/spaces/:spaceId/join
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "hyperfocusLevel": 8
}
```

## 🔌 Socket.IO Events

### 🧠 Focus Sessions (`/focus` namespace)

```javascript
// Connect with authentication
const socket = io('http://localhost:5000/focus', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Start focus session
socket.emit('start-focus-session', {
  templateId: 'pomodoro-classic',
  taskDescription: 'Complete API documentation',
  difficulty: 'medium',
  energyLevel: 7,
  backgroundSound: 'brown-noise'
});

// Listen for timer updates
socket.on('timer-update', (data) => {
  console.log(`Time remaining: ${data.timeRemaining} minutes`);
});

// Report distraction
socket.emit('report-distraction', {
  distractionType: 'mind-wandering',
  intensity: 3
});
```

### 👥 Body Doubling (`/body-doubling` namespace)

```javascript
// Request accountability partner
socket.emit('request-partner', {
  sessionDuration: 60,
  taskType: 'coding',
  communicationLevel: 'moderate',
  neurodivergentFriendly: true
});

// Listen for partner match
socket.on('partner-matched', (data) => {
  console.log(`Matched with ${data.partnerUsername}!`);
});

// Send focus check-in
socket.emit('focus-checkin', {
  taskDescription: 'Working on user authentication',
  energyLevel: 8,
  mood: 'focused'
});
```

### 💬 Chat (`/chat` namespace)

```javascript
// Join space chat
socket.emit('join-space-chat', 'space_12345');

// Send message
socket.emit('send-message', {
  spaceId: 'space_12345',
  content: 'Great discussion about ADHD strategies!',
  messageType: 'text'
});

// Listen for new messages
socket.on('new-message', (message) => {
  console.log(`${message.username}: ${message.content}`);
});

// Typing indicators
socket.emit('typing-start', { spaceId: 'space_12345' });
socket.emit('typing-stop', { spaceId: 'space_12345' });
```

## 🗄️ Database Schema

### User Model
```javascript
{
  userId: "usr_1234567890_abcdef",
  username: "neurodivergent_user",
  email: "user@example.com",
  neurodivergentProfile: {
    isNeurodivergent: true,
    conditions: ["ADHD", "Anxiety"],
    accommodations: {
      largeText: false,
      highContrast: true,
      reduceMotion: false
    },
    focusPreferences: {
      preferredSessionLength: 25,
      breakLength: 5,
      backgroundSounds: "brown-noise",
      energyTracking: true
    }
  },
  gamification: {
    level: 5,
    xp: 1250,
    streak: 7,
    achievements: [...]
  }
}
```

### Interest Space Model
```javascript
{
  spaceId: "space_1234567890_abcdef",
  name: "ADHD Programmers",
  category: "Technology",
  tags: ["programming", "adhd", "coding"],
  creator: "usr_1234567890_abcdef",
  members: [{
    userId: "usr_1234567890_abcdef",
    role: "admin",
    hyperfocusLevel: 8,
    joinedAt: "2024-01-15T10:00:00Z"
  }],
  settings: {
    privacy: "public",
    allowBodyDoubling: true,
    allowFocusSessions: true,
    neurodivergentFriendly: true
  }
}
```

## 🛠️ Development

### Project Structure
```
api-gateway/
├── src/
│   ├── index.js              # Main server file
│   ├── models/               # MongoDB schemas
│   │   └── index.js
│   ├── routes/               # REST API routes
│   │   ├── auth.js
│   │   └── spaces.js
│   ├── services/             # Socket.IO handlers
│   │   ├── socketAuth.js
│   │   ├── focusSessionSocket.js
│   │   ├── bodyDoublingSocket.js
│   │   └── chatSocket.js
│   └── middleware/           # Express middleware
│       ├── auth.js
│       ├── logger.js
│       └── errorHandler.js
├── package.json
├── .env.example
└── README.md
```

### Running Tests
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Test coverage
npm run test:coverage
```

### Code Quality
```bash
# Linting
npm run lint

# Format code
npm run format

# Type checking (if using TypeScript)
npm run type-check
```

## 🚀 Deployment

### Docker
```bash
# Build image
docker build -t hyperfocus-zone-api .

# Run container
docker run -p 5000:5000 \
  -e MONGODB_URI=mongodb://mongo:27017/hyperfocus-zone \
  -e JWT_SECRET=your-production-secret \
  hyperfocus-zone-api
```

### Environment Variables (Production)
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hyperfocus-zone
JWT_SECRET=your-super-secure-production-secret
JWT_REFRESH_SECRET=your-super-secure-refresh-secret
FRONTEND_URL=https://your-frontend-domain.com
REDIS_URL=redis://your-redis-instance:6379
```

## 🔧 Configuration

### ADHD-Optimized Defaults
- **Session Length**: 25 minutes (customizable 15-45)
- **Break Length**: 5 minutes (customizable 3-10)
- **Flow State Detection**: Enabled
- **Distraction Tracking**: Enabled
- **Energy Level Monitoring**: Enabled
- **Sensory Accommodations**: Configurable per user

### Rate Limiting
- **Auth Endpoints**: 5 attempts per 15 minutes
- **General API**: 100 requests per 15 minutes
- **Socket Connections**: 10 per minute per IP

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-adhd-feature`
3. **Follow ADHD-friendly development practices**:
   - Keep functions small and focused
   - Use descriptive variable names
   - Add helpful comments for context switching
   - Include accessibility considerations
4. **Test thoroughly** with neurodivergent use cases
5. **Submit pull request** with clear description

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: GitHub Issues for bug reports and feature requests
- **Community**: Join our Discord for ADHD-friendly development discussions
- **Email**: support@hyperfocus-zone.com

## 🎖️ Acknowledgments

Built with love for the neurodivergent community. Special thanks to:
- ADHD developers who provided feedback and testing
- Accessibility advocates who guided inclusive design
- The open-source community for amazing tools and libraries

---

**🌟 Remember: Every brain works differently, and that's a superpower! 🌟**
