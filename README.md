# Meo Meo Ký Frontend

Frontend application for the Meo Meo Ký project, built with Next.js 15, React 19, and TypeScript.

## Features

- **Authentication System**: JWT-based login/logout with refresh tokens
- **Story Management**: View, create, edit, and delete stories
- **Chapter Management**: View, create, edit, and delete chapters
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **TypeScript**: Full type safety throughout the application
- **Vietnamese Language**: Localized for Vietnamese users

## Prerequisites

- Node.js 18+ 
- Backend server running (see backend README)
- MongoDB database configured

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── admin/             # Admin dashboard (authenticated)
│   ├── contact/           # Contact form page
│   ├── login/             # Login page
│   ├── stories/           # Stories listing and detail pages
│   └── layout.tsx         # Root layout with AuthProvider
├── component/              # Reusable components
│   └── NavigationBar/     # Main navigation component
├── contexts/               # React contexts
│   └── AuthContext.tsx    # Authentication context
├── lib/                    # Utility libraries
│   └── auth.ts            # Authentication service
├── services/               # API services
│   └── storyService.ts    # Story/Chapter API calls
└── types/                  # TypeScript type definitions
    └── story.ts           # Story/Chapter interfaces
```

## Authentication Flow

1. **Login**: User enters credentials → receives JWT tokens
2. **Token Management**: Access tokens (15min) + Refresh tokens (7 days)
3. **Auto-refresh**: Automatically refresh expired access tokens
4. **Logout**: Invalidate all refresh tokens

## API Integration

The frontend communicates with the backend through:
- **RESTful APIs**: Stories, chapters, messages
- **JWT Authentication**: Protected routes require valid tokens
- **Error Handling**: Comprehensive error handling and user feedback

## Key Components

### NavigationBar
- Responsive navigation with mobile menu
- Authentication-aware (shows login/logout based on auth state)
- Links to all major sections

### AuthContext
- Manages user authentication state
- Provides login/logout functions
- Handles token storage and refresh

### StoryService
- Centralized API calls for stories/chapters
- Handles authentication headers
- Automatic token refresh on 401 errors

## Pages

### Public Pages
- **Home** (`/`): Landing page with introduction
- **Stories** (`/stories`): Browse all public stories
- **Story Detail** (`/stories/[id]`): View story with chapter list
- **Chapter Detail** (`/stories/[id]/chapters/[chapterId]`): Read individual chapters
- **Contact** (`/contact`): Send messages to author

### Protected Pages (Admin)
- **Login** (`/login`): User authentication
- **Admin Dashboard** (`/admin`): Management overview
- **Story Management**: Create/edit stories
- **Chapter Management**: Create/edit chapters

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-first approach
- **Vietnamese UI**: Localized text and date formats
- **Modern Design**: Clean, professional appearance

## Development

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Component Structure**: Consistent component organization

## Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm run start
   ```

3. **Environment Variables**: Ensure `NEXT_PUBLIC_API_URL` points to your production backend

## Troubleshooting

### Common Issues

1. **API Connection Errors**:
   - Check backend server is running
   - Verify `NEXT_PUBLIC_API_URL` in `.env.local`
   - Check CORS configuration on backend

2. **Authentication Issues**:
   - Clear browser localStorage
   - Check JWT secrets on backend
   - Verify user exists in database

3. **Build Errors**:
   - Clear `.next` folder
   - Check TypeScript errors
   - Verify all dependencies installed

### Getting Help

- Check backend logs for API errors
- Verify MongoDB connection
- Check browser console for frontend errors
- Ensure all environment variables are set

## Contributing

1. Follow TypeScript best practices
2. Use consistent component structure
3. Add proper error handling
4. Test responsive design on mobile
5. Maintain Vietnamese language support
