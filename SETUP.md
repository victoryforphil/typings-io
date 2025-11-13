# typings-io Setup Guide

This is a fork of typings.gg with added user authentication and game history tracking features.

## New Features

✨ **User Authentication**: Sign in with Clerk to track your progress
📊 **Game History**: Automatically saves your last 100 typing tests
📈 **Analytics Page**: View your performance over time with interactive charts
🎯 **Stats Dashboard**: See your average WPM, accuracy, and best scores

## Setup Instructions

### 1. Create a Clerk Account

1. Go to [https://clerk.com](https://clerk.com) and sign up for a free account
2. Create a new application in the Clerk Dashboard
3. Choose your preferred authentication methods (Email, Google, GitHub, etc.)

### 2. Get Your Clerk Publishable Key

1. In the Clerk Dashboard, go to **API Keys**
2. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)

### 3. Configure the Application

1. Open `clerk-init.js` in a text editor
2. Replace `YOUR_CLERK_PUBLISHABLE_KEY_HERE` with your actual Clerk publishable key:

```javascript
const CLERK_PUBLISHABLE_KEY = 'pk_test_your_actual_key_here';
```

3. Save the file

### 4. Run the Application

You can run this application in several ways:

#### Option A: Using a Local Web Server (Recommended)

```bash
# Using Python 3
python3 -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have http-server installed)
npx http-server -p 8000
```

Then open your browser and go to `http://localhost:8000`

#### Option B: Using VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html` and select "Open with Live Server"

#### Option C: Deploy to a Hosting Service

- **GitHub Pages**: Push to a GitHub repository and enable GitHub Pages
- **Netlify**: Drag and drop your project folder
- **Vercel**: Connect your repository for automatic deployments

## How It Works

### Authentication

- Click the "Sign In" button in the top right to create an account or log in
- Once authenticated, your game history will be automatically saved
- Click "Sign Out" to log out

### Playing the Game

- Choose between word count or time modes
- Start typing when ready - the timer starts with your first keystroke
- Your results (WPM and accuracy) are automatically saved after each test

### Viewing History

- Click the "history" link in the footer (only visible when logged in)
- View your statistics, performance chart, and recent tests
- Filter by mode (word count or time) to see specific performance trends

## Data Storage

- Game history is stored as **public user metadata** in Clerk
- Only the last **100 tests** are kept (oldest are automatically removed)
- Each test includes:
  - WPM (Words Per Minute)
  - Accuracy percentage
  - Mode (wordcount or time)
  - Count (word count or seconds)
  - Timestamp

## Privacy

Your game history is stored in Clerk's secure infrastructure. The data is associated with your user account and includes:
- Your typing test results (WPM, accuracy, mode, etc.)
- No personally identifiable information beyond what you provide to Clerk during signup

## Troubleshooting

### "Setup Clerk Key" message appears
- You haven't configured your Clerk publishable key yet
- Follow steps 2-3 above to add your key

### Sign in button doesn't work
- Check the browser console for errors
- Verify your Clerk publishable key is correct
- Ensure you're running the app on a web server (not just opening the HTML file)

### History page is empty
- Make sure you're signed in
- Complete at least one typing test
- Check the browser console for errors

### Authentication modal doesn't appear
- Ensure Clerk SDK is loading (check browser console)
- Try refreshing the page
- Check your internet connection

## Development

To modify or extend the application:

- `clerk-init.js`: Handles Clerk authentication and data saving
- `main.js`: Core typing game logic
- `history.js`: History page and chart rendering
- `index.html`: Main game page
- `history.html`: History and analytics page

## Support

For issues related to:
- **Clerk authentication**: Visit [Clerk Documentation](https://clerk.com/docs)
- **Original typing game**: See the [typings GitHub](https://github.com/briano1905/typings)
- **This fork**: Check the repository issues page

## Credits

Based on [typings.gg](https://typings.gg) by briano1905
Enhanced with Clerk authentication and history tracking
