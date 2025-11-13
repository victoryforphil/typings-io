// Clerk configuration
// IMPORTANT: Replace this with your actual Clerk publishable key
// You can get this from https://dashboard.clerk.com/
const CLERK_PUBLISHABLE_KEY = 'YOUR_CLERK_PUBLISHABLE_KEY_HERE';

// Initialize Clerk
let clerkInstance = null;
let currentUser = null;

async function initializeClerk() {
  try {
    if (CLERK_PUBLISHABLE_KEY === 'YOUR_CLERK_PUBLISHABLE_KEY_HERE') {
      console.warn('Please set your Clerk publishable key in clerk-init.js');
      // Show a message to the user in the UI
      const userButton = document.getElementById('user-button');
      userButton.innerHTML = '<span style="font-size: 0.9rem; opacity: 0.7;">Setup Clerk Key</span>';
      userButton.style.display = 'block';
      return;
    }

    clerkInstance = window.Clerk;
    await clerkInstance.load({
      publishableKey: CLERK_PUBLISHABLE_KEY
    });

    // Update UI based on authentication state
    updateAuthUI();

    // Listen for auth state changes
    clerkInstance.addListener((resources) => {
      currentUser = clerkInstance.user;
      updateAuthUI();
    });
  } catch (error) {
    console.error('Error initializing Clerk:', error);
  }
}

function updateAuthUI() {
  const userButton = document.getElementById('user-button');
  const historyLink = document.getElementById('history-link');
  
  if (clerkInstance && clerkInstance.user) {
    currentUser = clerkInstance.user;
    
    // Show user info and sign out button
    const userName = currentUser.firstName || currentUser.username || currentUser.emailAddresses[0]?.emailAddress || 'User';
    userButton.innerHTML = `
      <span style="margin-right: 0.5rem;">${userName}</span>
      <button id="sign-out-btn" style="padding: 0.2rem 0.6rem; cursor: pointer;">Sign Out</button>
    `;
    userButton.style.display = 'flex';
    userButton.style.alignItems = 'center';
    
    // Add sign out handler
    document.getElementById('sign-out-btn').addEventListener('click', async () => {
      await clerkInstance.signOut();
    });
    
    // Show history link
    if (historyLink) {
      historyLink.style.display = 'inline';
    }
  } else {
    // Show sign in button
    userButton.innerHTML = '<button id="sign-in-btn" style="padding: 0.4rem 1rem; cursor: pointer; font: inherit;">Sign In</button>';
    userButton.style.display = 'block';
    
    // Add sign in handler
    setTimeout(() => {
      const signInBtn = document.getElementById('sign-in-btn');
      if (signInBtn) {
        signInBtn.addEventListener('click', async () => {
          await clerkInstance.openSignIn();
        });
      }
    }, 100);
    
    // Hide history link
    if (historyLink) {
      historyLink.style.display = 'none';
    }
  }
}

// Function to save game result to Clerk user metadata
async function saveGameResult(wpm, accuracy, mode, count, timestamp) {
  if (!clerkInstance || !currentUser) {
    console.log('User not authenticated, skipping save');
    return;
  }

  try {
    // Get existing history from public metadata
    const existingHistory = currentUser.publicMetadata?.gameHistory || [];
    
    // Create new game entry
    const gameEntry = {
      wpm,
      accuracy,
      mode,
      count,
      timestamp: timestamp || new Date().toISOString()
    };
    
    // Add new entry and keep only last 100
    const updatedHistory = [gameEntry, ...existingHistory].slice(0, 100);
    
    // Update user metadata
    await currentUser.update({
      publicMetadata: {
        gameHistory: updatedHistory
      }
    });
    
    console.log('Game result saved successfully');
  } catch (error) {
    console.error('Error saving game result:', error);
  }
}

// Function to get game history
async function getGameHistory() {
  if (!clerkInstance || !currentUser) {
    return [];
  }
  
  // Reload user to get latest data
  await currentUser.reload();
  return currentUser.publicMetadata?.gameHistory || [];
}

// Initialize Clerk when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeClerk);
} else {
  initializeClerk();
}
