// Get document element
const textDisplay = document.querySelector('#text-display');
const inputField = document.querySelector('#input-field');
const authStatus = document.querySelector('#auth-status');
const signInButton = document.querySelector('#sign-in-button');
const userButtonRoot = document.querySelector('#user-button-root');
const historyLink = document.querySelector('#history-link');

// Constants
const MAX_HISTORY_LENGTH = 100;

// Clerk state
let clerkClient = null;
let clerkIsLoaded = false;
let activeClerkUser = null;
let lastSavedResultId = null;
let saveErrorNotified = false;

// Initialize typing mode variables
let typingMode = 'wordcount';
let wordCount;
let timeCount;

// Initialize dynamic variables
let randomWords = [];
let wordList = [];
let currentWord = 0;
let correctKeys = 0;
let startDate = 0;
let timer;
let timerActive = false;
let punctuation = false;

// Get cookies
getCookie('theme') === '' ? setTheme('light') : setTheme(getCookie('theme'));
getCookie('language') === '' ? setLanguage('english') : setLanguage(getCookie('language'));
getCookie('wordCount') === '' ? setWordCount(50) : setWordCount(getCookie('wordCount'));
getCookie('timeCount') === '' ? setTimeCount(60) : setTimeCount(getCookie('timeCount'));
getCookie('typingMode') === '' ? setTypingMode('wordcount') : setTypingMode(getCookie('typingMode'));
getCookie('punctuation') === '' ? setPunctuation('false') : setPunctuation(getCookie('punctuation'));

// Find a list of words and display it to textDisplay
function setText(e) {
  e = e || window.event;
  var keepWordList = e && e.shiftKey;

  // Reset
  if (!keepWordList) {
    wordList = [];
  }
  currentWord = 0;
  correctKeys = 0;
  inputField.value = '';
  timerActive = false;
  clearTimeout(timer);
  textDisplay.style.display = 'block';
  inputField.className = '';

  switch (typingMode) {
    case 'wordcount':
      textDisplay.style.height = 'auto';
      textDisplay.innerHTML = '';
      if (!keepWordList) {
        wordList = [];
        while (wordList.length < wordCount) {
          const randomWord = randomWords[Math.floor(Math.random() * randomWords.length)];
          if (wordList[wordList.length - 1] !== randomWord || wordList[wordList.length - 1] === undefined || getCookie('language') === 'dots') {
            wordList.push(randomWord);
          }
        }
      }
      break;

    case 'time':
      textDisplay.style.height = '3.2rem';
      document.querySelector(`#tc-${timeCount}`).innerHTML = timeCount;
      textDisplay.innerHTML = '';
      if (!keepWordList) {
        wordList = [];
        for (i = 0; i < 500; i++) {
          let n = Math.floor(Math.random() * randomWords.length);
          wordList.push(randomWords[n]);
        }
      }
  }

  if (punctuation) addPunctuations();
  showText();
  inputField.focus();
}

function addPunctuations() {
  if (wordList[0] !== undefined) {
    // Capitalize first word
    wordList[0] = wordList[0][0].toUpperCase() + wordList[0].slice(1);

    // Add comma, fullstop, question mark, exclamation mark, semicolon. Capitalize the next word
    for (i = 0; i < wordList.length; i++) {
      const ran = Math.random();
      if (i < wordList.length - 1) {
        if (ran < 0.03) {
          wordList[i] += ',';
        } else if (ran < 0.05) {
          wordList[i] += '.';
          wordList[i + 1] = wordList[i + 1][0].toUpperCase() + wordList[i + 1].slice(1);
        } else if (ran < 0.06) {
          wordList[i] += '?';
          wordList[i + 1] = wordList[i + 1][0].toUpperCase() + wordList[i + 1].slice(1);
        } else if (ran < 0.07) {
          wordList[i] += '!';
          wordList[i + 1] = wordList[i + 1][0].toUpperCase() + wordList[i + 1].slice(1);
        } else if (ran < 0.08) {
          wordList[i] += ';';
        }
      }
    }
    wordList[wordList.length - 1] += '.';

    // Add quotation marks
  }
}

// Display text to textDisplay
function showText() {
  wordList.forEach(word => {
    let span = document.createElement('span');
    span.innerHTML = word + ' ';
    textDisplay.appendChild(span);
  });
  textDisplay.firstChild.classList.add('highlight');
}

// Key is pressed in input field
inputField.addEventListener('keydown', e => {
  // Add wrong class to input field
  switch (typingMode) {
    case 'wordcount':
      if (currentWord < wordList.length) inputFieldClass();
    case 'time':
      if (timerActive) inputFieldClass();
  }
  function inputFieldClass() {
    if (e.key >= 'a' && e.key <= 'z' || (e.key === `'` || e.key === ',' || e.key === '.' || e.key === ';')) {
      let inputWordSlice = inputField.value + e.key;
      let currentWordSlice = wordList[currentWord].slice(0, inputWordSlice.length);
      inputField.className = inputWordSlice === currentWordSlice ? '' : 'wrong';
    } else if (e.key === 'Backspace') {
      let inputWordSlice = e.ctrlKey ? '' : inputField.value.slice(0, inputField.value.length - 1);
      let currentWordSlice = wordList[currentWord].slice(0, inputWordSlice.length);
      inputField.className = inputWordSlice === currentWordSlice ? '' : 'wrong';
    } else if (e.key === ' ') {
      inputField.className = '';
    }
  }

  // If it is the first character entered
  if (currentWord === 0 && inputField.value === '') {
    switch (typingMode) {
      case 'wordcount':
        startDate = Date.now();
        break;

      case 'time':
        if (!timerActive) {
          startTimer(timeCount);
          timerActive = true;
        }
        function startTimer(time) {
          if (time > 0) {
            document.querySelector(`#tc-${timeCount}`).innerHTML = time;
            timer = setTimeout(() => {
              time--;
              startTimer(time);
            }, 1000);
          } else {
            timerActive = false;
            textDisplay.style.display = 'none';
            inputField.className = '';
            document.querySelector(`#tc-${timeCount}`).innerHTML = timeCount;
            showResult();
          }
        }
    }
  }

  // If it is the space key check the word and add correct/wrong class
  if (e.key === ' ') {
    e.preventDefault();

    if (inputField.value !== '') {
      // Scroll down text when reach new line
      if (typingMode === 'time') {
        const currentWordPosition = textDisplay.childNodes[currentWord].getBoundingClientRect();
        const nextWordPosition = textDisplay.childNodes[currentWord + 1].getBoundingClientRect();
        if (currentWordPosition.top < nextWordPosition.top) {
          for (i = 0; i < currentWord + 1; i++) textDisplay.childNodes[i].style.display = 'none';
        }
      }

      // If it is not the last word increment currentWord,
      if (currentWord < wordList.length - 1) {
        if (inputField.value === wordList[currentWord]) {
          textDisplay.childNodes[currentWord].classList.add('correct');
          correctKeys += wordList[currentWord].length + 1;
        } else {
          textDisplay.childNodes[currentWord].classList.add('wrong');
        }
        textDisplay.childNodes[currentWord + 1].classList.add('highlight');
      } else if (currentWord === wordList.length - 1) {
        textDisplay.childNodes[currentWord].classList.add('wrong');
        showResult();
      }

      inputField.value = '';
      currentWord++;
    }

    // Else if it is the last word and input word is correct show the result
  } else if (currentWord === wordList.length - 1) {
    if (inputField.value + e.key === wordList[currentWord]) {
      textDisplay.childNodes[currentWord].classList.add('correct');
      correctKeys += wordList[currentWord].length;
      currentWord++;
      showResult();
    }
  }
});

// Calculate and display result
function showResult() {
  let words = 0;
  let minute = 1;
  let acc = 0;

  switch (typingMode) {
    case 'wordcount': {
      words = correctKeys / 5;
      minute = Math.max((Date.now() - startDate) / 1000 / 60, 0.01);
      let totalKeys = -1;
      wordList.forEach(e => (totalKeys += e.length + 1));
      totalKeys = Math.max(totalKeys, 1);
      acc = Math.min(Math.floor((correctKeys / totalKeys) * 100), 100);
      break;
    }
    case 'time': {
      words = correctKeys / 5;
      minute = Math.max(timeCount / 60, 0.01);
      let sumKeys = -1;
      for (let i = 0; i < currentWord; i++) {
        sumKeys += wordList[i].length + 1;
      }
      sumKeys = Math.max(sumKeys, 1);
      acc = Math.min(Math.floor((correctKeys / sumKeys) * 100), 100);
      break;
    }
    default:
      break;
  }

  const wpm = Math.floor(words / minute);
  document.querySelector('#right-wing').innerHTML = `WPM: ${wpm} / ACC: ${acc}`;

  const resultPayload = {
    id: `${Date.now()}`,
    timestamp: new Date().toISOString(),
    wpm,
    accuracy: acc,
    mode: typingMode,
    language: getCookie('language') || 'english',
    punctuation: Boolean(punctuation),
    wordCount: typingMode === 'wordcount' ? Number(wordCount) : null,
    timeLimitSeconds: typingMode === 'time' ? Number(timeCount) : null,
    durationSeconds: Math.round(minute * 60),
  };

  saveGameResult(resultPayload);
}

// Command actions
document.addEventListener('keydown', e => {
  // Modifiers Windows: [Alt], Mac: [Cmd + Ctrl]
  if (e.altKey || (e.metaKey && e.ctrlKey)) {
    // [mod + t] => Change the theme
    if (e.key === 't') {
      setTheme(inputField.value);
    }
    // [mod + l] => Change the language
    if (e.key === 'l') {
      setLanguage(inputField.value);
    }

    // [mod + m] => Change the typing mode
    if (e.key === 'm') {
      setTypingMode(inputField.value);
    }

    // [mod + p] => Change punctuation active
    if (e.key === 'p') {
      setPunctuation(inputField.value);
    }
  } else if (!document.querySelector('#theme-center').classList.contains('hidden')) {
    if (e.key === 'Escape'){
      hideThemeCenter();
      inputField.focus();
    }
  } else if (e.key === 'Escape') {
    setText(e);
  }
});

function setTheme(_theme) {
  const theme = _theme.toLowerCase();
  fetch(`themes/${theme}.css`)
    .then(response => {
      if (response.status === 200) {
        response
          .text()
          .then(css => {
            setCookie('theme', theme, 90);
            document.querySelector('#theme').setAttribute('href', `themes/${theme}.css`);
            setText();
          })
          .catch(err => console.error(err));
      } else {
        console.log(`theme ${theme} is undefine`);
      }
    })
    .catch(err => console.error(err));
}

function setLanguage(_lang) {
  const lang = _lang.toLowerCase();
  fetch('texts/random.json')
    .then(response => response.json())
    .then(json => {
      if (typeof json[lang] !== 'undefined') {
        randomWords = json[lang];
        setCookie('language', lang, 90);

        if (lang === "arabic") {
            textDisplay.style.direction = "rtl"
            inputField.style.direction = "rtl"
        } else {
            textDisplay.style.direction = "ltr"
            inputField.style.direction = "ltr"
        }

        setText();
      } else {
        console.error(`language ${lang} is undefine`);
      }
    })
    .catch(err => console.error(err));
}

function setTypingMode(_mode) {
  const mode = _mode.toLowerCase();
  switch (mode) {
    case 'wordcount':
      typingMode = mode;
      setCookie('typingMode', mode, 90);
      document.querySelector('#word-count').style.display = 'inline';
      document.querySelector('#time-count').style.display = 'none';
      setText();
      break;
    case 'time':
      typingMode = mode;
      setCookie('typingMode', mode, 90);
      document.querySelector('#word-count').style.display = 'none';
      document.querySelector('#time-count').style.display = 'inline';
      setText();
      break;
    default:
      console.error(`mode ${mode} is undefine`);
  }
}

function setPunctuation(_punc) {
  const punc = _punc.toLowerCase();
  if (punc === 'true') {
    punctuation = true;
    setCookie('punctuation', true, 90);
    setText();
  } else if (punc === 'false') {
    punctuation = false;
    setCookie('punctuation', false, 90);
    setText();
  }
}

function setWordCount(wc) {
  setCookie('wordCount', wc, 90);
  wordCount = wc;
  document.querySelectorAll('#word-count > span').forEach(e => (e.style.borderBottom = ''));
  document.querySelector(`#wc-${wordCount}`).style.borderBottom = '2px solid';
  setText();
}

function setTimeCount(tc) {
  setCookie('timeCount', tc, 90);
  timeCount = tc;
  document.querySelectorAll('#time-count > span').forEach(e => {
    e.style.borderBottom = '';
    e.innerHTML = e.id.substring(3, 6);
  });
  document.querySelector(`#tc-${timeCount}`).style.borderBottom = '2px solid';
  setText();
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function getCookie(cname) {
  var name = cname + '=';
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

function setAuthStatus(message, tone = 'info') {
  if (!authStatus) {
    return;
  }
  if (!message) {
    authStatus.classList.add('hidden');
    authStatus.textContent = '';
    authStatus.removeAttribute('data-tone');
    return;
  }
  authStatus.textContent = message;
  authStatus.classList.remove('hidden');
  authStatus.setAttribute('data-tone', tone);
}

function waitForClerkSDK(maxWait = 7000) {
  if (window.Clerk) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      if (window.Clerk) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - start > maxWait) {
        clearInterval(interval);
        reject(new Error('Clerk SDK failed to load within the allotted time.'));
      }
    }, 50);
  });
}

async function initializeClerk() {
  if (typeof window === 'undefined') {
    return;
  }

  if (!window.CLERK_PUBLISHABLE_KEY) {
    setAuthStatus('Add your Clerk publishable key to config.js to enable sign in and history tracking.');
    return;
  }

  try {
    await waitForClerkSDK();
  } catch (error) {
    console.error('Clerk SDK not available', error);
    setAuthStatus('Authentication is currently unavailable. Check your network connection.', 'error');
    return;
  }

  try {
    await window.Clerk.load({ publishableKey: window.CLERK_PUBLISHABLE_KEY });
  } catch (error) {
    console.error('Failed to initialize Clerk', error);
    setAuthStatus('Authentication is currently unavailable. Check console for details.', 'error');
    return;
  }

  clerkClient = window.Clerk;
  clerkIsLoaded = true;
  activeClerkUser = clerkClient.user || null;

  if (userButtonRoot && typeof clerkClient.mountUserButton === 'function') {
    clerkClient.mountUserButton(userButtonRoot);
  }

  if (signInButton) {
    signInButton.addEventListener('click', () => {
      if (!clerkIsLoaded || !clerkClient || typeof clerkClient.openSignIn !== 'function') {
        return;
      }
      clerkClient.openSignIn({ afterSignInUrl: window.location.href });
    });
  }

  updateAuthUI(activeClerkUser);

  if (typeof clerkClient.addListener === 'function') {
    clerkClient.addListener(({ user }) => {
      activeClerkUser = user || null;
      if (!activeClerkUser) {
        lastSavedResultId = null;
      }
      updateAuthUI(activeClerkUser);
      if (activeClerkUser) {
        saveErrorNotified = false;
      }
    });
  }
}

function updateAuthUI(user) {
  if (!clerkIsLoaded) {
    return;
  }

  if (signInButton) {
    if (user) {
      signInButton.classList.add('hidden');
    } else {
      signInButton.classList.remove('hidden');
    }
  }

  if (userButtonRoot) {
    if (user) {
      userButtonRoot.classList.remove('hidden');
    } else {
      userButtonRoot.classList.add('hidden');
    }
  }

  if (historyLink) {
    if (user) {
      historyLink.classList.remove('hidden');
    } else {
      historyLink.classList.add('hidden');
    }
  }

  if (user) {
    if (!saveErrorNotified) {
      setAuthStatus('');
    }
  } else {
    setAuthStatus('Sign in to save your typing history and unlock the stats page.');
  }
}

function parseOptionalNumber(value) {
  if (value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function sanitizeHistoryEntry(entry) {
  const wpm = Number(entry.wpm);
  const accuracy = Number(entry.accuracy);
  return {
    id: entry.id ? String(entry.id) : entry.timestamp,
    timestamp: entry.timestamp,
    wpm: Number.isFinite(wpm) ? wpm : 0,
    accuracy: Number.isFinite(accuracy) ? accuracy : 0,
    mode: entry.mode,
    language: entry.language,
    punctuation: Boolean(entry.punctuation),
    wordCount: parseOptionalNumber(entry.wordCount),
    timeLimitSeconds: parseOptionalNumber(entry.timeLimitSeconds),
    durationSeconds: parseOptionalNumber(entry.durationSeconds),
  };
}

function isValidHistoryEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return false;
  }
  if (typeof entry.timestamp !== 'string') {
    return false;
  }
  if (!Number.isFinite(Number(entry.wpm))) {
    return false;
  }
  if (!Number.isFinite(Number(entry.accuracy))) {
    return false;
  }
  return true;
}

async function saveGameResult(result) {
  if (!clerkIsLoaded || !activeClerkUser || !result || typeof result !== 'object') {
    return;
  }

  const resultId = String(result.id || result.timestamp);
  if (lastSavedResultId === resultId) {
    return;
  }

  if (typeof activeClerkUser.update !== 'function') {
    console.warn('Clerk user update function unavailable; skipping history save.');
    return;
  }

  const currentMetadata = activeClerkUser.publicMetadata || {};
  const existingHistory = Array.isArray(currentMetadata.gameHistory)
    ? currentMetadata.gameHistory.filter(isValidHistoryEntry)
    : [];
  const sanitizedResult = sanitizeHistoryEntry(result);
  const trimmedHistory = existingHistory.slice(0, MAX_HISTORY_LENGTH - 1);
  const history = [sanitizedResult, ...trimmedHistory];

  try {
    const updatedUser = await activeClerkUser.update({
      publicMetadata: {
        ...currentMetadata,
        gameHistory: history,
      },
    });
    activeClerkUser = updatedUser || activeClerkUser;
    lastSavedResultId = resultId;
    if (saveErrorNotified) {
      setAuthStatus('');
      saveErrorNotified = false;
    }
  } catch (error) {
    console.error('Unable to save typing history', error);
    if (!saveErrorNotified) {
      setAuthStatus('We could not sync your latest result. Please try again.', 'error');
      saveErrorNotified = true;
    }
  }
}

initializeClerk();
showAllThemes();
function showAllThemes(){
    fetch(`themes/theme-list.json`)
    .then(response => {
      if (response.status === 200) {
        response
          .text()
          .then(body => {
            let themes = JSON.parse(body);
            let keys = Object.keys(themes);
            let i;
            for(i = 0;i < keys.length; i ++){

              let theme = document.createElement('div');
              theme.setAttribute('class', 'theme-button');
              theme.setAttribute('onClick', `setTheme('${keys[i]}')`);
              theme.setAttribute('id', keys[i]);

              // set tabindex to current theme index + 4 for the test page
              theme.setAttribute('tabindex', i + 5);
              theme.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                  setTheme(theme.id);
                  inputField.focus();

                }
              })

              if(themes[keys[i]]['customHTML'] != undefined){
                theme.style.background = themes[keys[i]]['background'];
                theme.innerHTML = themes[keys[i]]['customHTML']
              }else{
                theme.textContent = keys[i];
                theme.style.background = themes[keys[i]]['background'];
                theme.style.color = themes[keys[i]]['color'];
              }
              document.getElementById('theme-area').appendChild(theme);
            }
          })
          .catch(err => console.error(err));
      } else {
        console.log(`Cant find theme-list.json`);
      }
    })
    .catch(err => console.error(err));
}

// enter to open theme area
document.getElementById('show-themes').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    showThemeCenter();
    inputField.focus();
  }
});

function showThemeCenter() {
  document.getElementById('theme-center').classList.remove('hidden');
  document.getElementById('command-center').classList.add('hidden');
}

function hideThemeCenter() {
  document.getElementById('theme-center').classList.add('hidden');
  document.getElementById('command-center').classList.remove('hidden');
}


