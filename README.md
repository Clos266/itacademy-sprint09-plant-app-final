# 🌱 PlantApp

> **Web platform for plant exchange between users**

A modern application built with React and TypeScript that allows users to exchange plants, organize gardening-related events, and connect with other plant enthusiasts.

## ✨ Key Features

- 🌿 **Plant Management**: Add, edit, and manage your personal plant collection
- 🔄 **Exchange System**: Propose and exchange plants with other users
- 📅 **Events**: Create and participate in plant and gardening-related events
- 💬 **Real-time Chat**: Communicate directly with other users
- 📍 **Exchange Points**: Locate physical places to make exchanges
- 🔐 **Secure Authentication**: Complete registration and login system
- 🌓 **Light/Dark Theme**: Interface adaptable to your preferences

## 🚀 Live Demo

[See PlantApp in action](https://itacademy-sprint09-plant-app-final.vercel.app/)

## 🛠️ Tech Stack

### Frontend

- **React 19** - Modern UI library
- **TypeScript** - Static typing for greater robustness
- **Vite** - Fast and efficient build tool
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Elegant and accessible UI components
- **React Router DOM** - Client-side navigation

### Backend & Database

- **Supabase** - Complete Backend-as-a-Service
- **PostgreSQL** - Robust relational database
- **Supabase Auth** - Authentication and authorization
- **Real-time** - Real-time updates

### Development Tools

- **Jest** - Testing framework
- **ESLint** - Code linting
- **GitHub Actions** - Automated CI/CD

## 📦 Installation and Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone the repository

```bash
git clone https://github.com/Clos266/itacademy-sprint09-plant-app-final.git
cd plantapp-v2
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_NAME=PlantApp
```

### 4. Run in development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📱 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build the application for production
npm run preview      # Preview production build

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Code Quality
npm run lint         # Lint code with ESLint
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable React components
│   ├── auth/           # Authentication components
│   ├── cards/          # Cards (plants, events, etc.)
│   ├── common/         # Common components
│   └── ui/             # Base shadcn/ui components
├── hooks/              # Custom hooks
├── pages/              # Main application pages
├── services/           # Services to connect with Supabase
├── types/              # TypeScript type definitions
├── utils/              # Utilities and helpers
└── config/             # Application configurations
```

## 🌟 Detailed Features

### 🌿 Plant Management

- Add new plants with photos and descriptions
- Edit existing plant information
- Advanced filtering and search system
- Grid and table visualization

### 🔄 Exchanges

- Create exchange proposals
- Validation and approval system
- Meeting point management
- Exchange history

### 📅 Events

- Create gardening and plant events
- Registration system
- Event calendar
- Details and locations

### 💬 Communication

- Real-time chat with Supabase
- Messaging between users
- Real-time notifications

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository with Vercel
2. Configure environment variables
3. Deploy automatically with each push

### Manual

```bash
npm run build
# Upload the dist/ folder to your web server
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Tests in watch mode
npm run test:watch

# Code coverage
npm run test:coverage
```

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 👨‍💻 Author

**Clos266**

- GitHub: [@Clos266](https://github.com/Clos266)
- Project: [PlantApp](https://github.com/Clos266/itacademy-sprint09-plant-app-final)

## 🙏 Acknowledgments

- [IT Academy](https://www.barcelonactiva.cat/es/itacademy) for training and support
- [Supabase](https://supabase.com/) for the excellent BaaS
- [shadcn/ui](https://ui.shadcn.com/) for the UI components
- React and TypeScript community
