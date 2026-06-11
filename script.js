// ==========================================================================
// CORE STATE MANAGEMENT
// ==========================================================================
const state = {
  theme: localStorage.getItem('theme') || 'dark',
  connectionMode: localStorage.getItem('connectionMode') || 'server',
  apiKey: localStorage.getItem('geminiApiKey') || '',
  activeOption: 'standard',
  activeTab: 'flashcards',
  viewMode: 'grid', // 'grid' or 'carousel'
  uploadedFileContent: '',
  generatedData: null,
  carouselIndex: 0
};

// ==========================================================================
// DOM ELEMENT SELECTIONS
// ==========================================================================
// Theme
const body = document.body;
const themeToggle = document.getElementById('themeToggle');

// Connection & Settings
const btnSettings = document.getElementById('btnSettings');
const settingsModal = document.getElementById('settingsModal');
const btnCloseSettings = document.getElementById('btnCloseSettings');
const btnSaveSettings = document.getElementById('btnSaveSettings');
const btnResetSettings = document.getElementById('btnResetSettings');
const modeServer = document.getElementById('modeServer');
const modeDirect = document.getElementById('modeDirect');
const directKeyConfig = document.getElementById('directKeyConfig');
const geminiApiKeyInput = document.getElementById('geminiApiKey');
const btnToggleKeyVisibility = document.getElementById('btnToggleKeyVisibility');
const apiStatusBadge = document.getElementById('apiStatusBadge');
const modalKeyStatus = document.getElementById('modalKeyStatus');

// Inputs
const lessonContent = document.getElementById('lessonContent');
const wordCounter = document.getElementById('wordCounter');
const btnClearInput = document.getElementById('btnClearInput');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileBanner = document.getElementById('fileBanner');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const btnRemoveFile = document.getElementById('btnRemoveFile');
const optionCards = document.querySelectorAll('.option-card');
const btnGenerate = document.getElementById('btnGenerate');

// Outputs & States
const stateEmpty = document.getElementById('stateEmpty');
const stateLoading = document.getElementById('stateLoading');
const stateResults = document.getElementById('stateResults');
const loadingProgress = document.getElementById('loadingProgress');
const loadingStatusText = document.getElementById('loadingStatusText');
const outputActions = document.getElementById('outputActions');
const tabsNavigation = document.getElementById('tabsNavigation');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

// Flashcard Specifics
const flashcardsGridContainer = document.getElementById('flashcardsGridContainer');
const flashcardsCarouselContainer = document.getElementById('flashcardsCarouselContainer');
const carouselCardPlaceholder = document.getElementById('carouselCardPlaceholder');
const btnFlipAll = document.getElementById('btnFlipAll');
const viewModeGrid = document.getElementById('viewModeGrid');
const viewModeCarousel = document.getElementById('viewModeCarousel');
const btnPrevCard = document.getElementById('btnPrevCard');
const btnNextCard = document.getElementById('btnNextCard');
const carouselProgressBar = document.getElementById('carouselProgressBar');
const carouselCardIndex = document.getElementById('carouselCardIndex');
const flashcardCount = document.getElementById('flashcardCount');

// Concepts & Revision Specifics
const conceptsContainer = document.getElementById('conceptsContainer');
const conceptCount = document.getElementById('conceptCount');
const revisionContainer = document.getElementById('revisionContainer');
const revisionCount = document.getElementById('revisionCount');

// Action Items
const btnCopyAll = document.getElementById('btnCopyAll');
const btnDownloadJson = document.getElementById('btnDownloadJson');
const toastContainer = document.getElementById('toastContainer');

// ==========================================================================
// TOAST NOTIFICATIONS & FEEDBACK
// ==========================================================================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  if (type === 'error') iconName = 'alert-triangle';
  if (type === 'warning') iconName = 'alert-circle';

  toast.innerHTML = `
    <div class="toast-icon"><i data-lucide="${iconName}"></i></div>
    <span class="toast-message">${message}</span>
  `;
  
  toastContainer.appendChild(toast);
  lucide.createIcons();

  // Slide out and remove
  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('transitionend', () => toast.remove());
  }, 4000);
}

// ==========================================================================
// INITIALIZATION & SETTINGS CONFIG
// ==========================================================================
function init() {
  // Theme Setup
  body.className = state.theme === 'dark' ? 'dark-theme' : 'light-theme';
  
  // Connection Mode Setup
  updateSettingsUI();
  updateApiStatusIndicator();

  // Event Listeners Registration
  registerEventListeners();

  // Initialize Lucide Icons
  lucide.createIcons();
}

function updateApiStatusIndicator() {
  const badgeDot = apiStatusBadge.querySelector('.status-dot');
  const badgeText = apiStatusBadge.querySelector('.status-text');

  if (state.connectionMode === 'server') {
    badgeDot.className = 'status-dot green';
    badgeText.textContent = 'Server Mode';
    modalKeyStatus.innerHTML = `<span class="badge badge-success">Running on Local Server</span>`;
  } else {
    if (state.apiKey) {
      badgeDot.className = 'status-dot green';
      badgeText.textContent = 'Direct (API Key)';
      modalKeyStatus.innerHTML = `<span class="badge badge-success">Key Configured</span>`;
    } else {
      badgeDot.className = 'status-dot orange';
      badgeText.textContent = 'Direct (No Key)';
      modalKeyStatus.innerHTML = `<span class="badge badge-warning">Missing API Key</span>`;
    }
  }
}

function updateSettingsUI() {
  if (state.connectionMode === 'server') {
    modeServer.classList.add('active');
    modeDirect.classList.remove('active');
    directKeyConfig.classList.add('hidden');
  } else {
    modeServer.classList.remove('active');
    modeDirect.classList.add('active');
    directKeyConfig.classList.remove('hidden');
  }
  geminiApiKeyInput.value = state.apiKey;
}

// ==========================================================================
// DUSTY EVENTS REGISTRY
// ==========================================================================
function registerEventListeners() {
  // Theme Toggle
  themeToggle.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    body.className = state.theme === 'dark' ? 'dark-theme' : 'light-theme';
    localStorage.setItem('theme', state.theme);
    showToast(`Switched to ${state.theme} theme`, 'success');
  });

  // Settings Modal Open/Close
  btnSettings.addEventListener('click', () => {
    updateSettingsUI();
    updateApiStatusIndicator();
    settingsModal.classList.remove('hidden');
  });

  btnCloseSettings.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });

  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.add('hidden');
    }
  });

  // Connection Mode Toggles in Modal
  modeServer.addEventListener('click', () => {
    state.connectionMode = 'server';
    updateSettingsUI();
  });

  modeDirect.addEventListener('click', () => {
    state.connectionMode = 'direct';
    updateSettingsUI();
  });

  // API Key Visibility
  btnToggleKeyVisibility.addEventListener('click', () => {
    const isPassword = geminiApiKeyInput.type === 'password';
    geminiApiKeyInput.type = isPassword ? 'text' : 'password';
    const icon = btnToggleKeyVisibility.querySelector('i');
    icon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
    lucide.createIcons();
  });

  // Settings Save/Reset
  btnSaveSettings.addEventListener('click', () => {
    const key = geminiApiKeyInput.value.trim();
    if (state.connectionMode === 'direct' && !key) {
      showToast('API Key is required for direct browser connections.', 'error');
      return;
    }
    
    state.apiKey = key;
    localStorage.setItem('connectionMode', state.connectionMode);
    localStorage.setItem('geminiApiKey', state.apiKey);
    
    updateApiStatusIndicator();
    settingsModal.classList.add('hidden');
    showToast('Settings saved successfully.', 'success');
  });

  btnResetSettings.addEventListener('click', () => {
    state.connectionMode = 'server';
    state.apiKey = '';
    geminiApiKeyInput.value = '';
    updateSettingsUI();
    showToast('Settings reset to default.', 'warning');
  });

  // Word Counter & Text Input
  lessonContent.addEventListener('input', () => {
    const text = lessonContent.value.trim();
    const wordCount = text === '' ? 0 : text.split(/\s+/).length;
    wordCounter.textContent = `${wordCount.toLocaleString()} / 2,000 words`;
    
    if (wordCount > 2000) {
      wordCounter.style.color = 'var(--danger)';
    } else {
      wordCounter.style.color = 'var(--text-muted)';
    }
  });

  // Clear Input Button
  btnClearInput.addEventListener('click', () => {
    lessonContent.value = '';
    wordCounter.textContent = '0 / 2,000 words';
    wordCounter.style.color = 'var(--text-muted)';
    removeUploadedFile();
    
    // Reset output panels to empty state
    stateResults.classList.remove('active');
    stateResults.classList.add('hidden');
    stateEmpty.classList.add('active');
    outputActions.classList.add('hidden');
    tabsNavigation.classList.add('hidden');
    
    showToast('Input fields cleared.', 'info');
  });

  // Option Cards Selection
  optionCards.forEach(card => {
    card.addEventListener('click', () => {
      optionCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.activeOption = card.getAttribute('data-option');
    });
  });

  // File Upload Drag & Drop Actions
  dropZone.addEventListener('click', () => fileInput.click());
  
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleUploadedFile(e.target.files[0]);
    }
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleUploadedFile(e.dataTransfer.files[0]);
    }
  });

  // Remove File Button
  btnRemoveFile.addEventListener('click', removeUploadedFile);

  // Tabs Navigation Actions
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      switchTab(tab);
    });
  });

  // View Mode Actions (Grid vs Carousel)
  viewModeGrid.addEventListener('click', () => {
    state.viewMode = 'grid';
    viewModeGrid.classList.add('active');
    viewModeCarousel.classList.remove('active');
    flashcardsGridContainer.classList.remove('hidden');
    flashcardsCarouselContainer.classList.add('hidden');
  });

  viewModeCarousel.addEventListener('click', () => {
    state.viewMode = 'carousel';
    viewModeGrid.classList.remove('active');
    viewModeCarousel.classList.add('active');
    flashcardsGridContainer.classList.add('hidden');
    flashcardsCarouselContainer.classList.remove('hidden');
    renderCarouselCard();
  });

  // Carousel Navigation Actions
  btnPrevCard.addEventListener('click', () => {
    if (state.carouselIndex > 0) {
      state.carouselIndex--;
      renderCarouselCard();
    }
  });

  btnNextCard.addEventListener('click', () => {
    if (state.carouselIndex < state.generatedData.flashcards.length - 1) {
      state.carouselIndex++;
      renderCarouselCard();
    }
  });

  // Flip All Button
  btnFlipAll.addEventListener('click', () => {
    const cards = document.querySelectorAll('.flashcard-grid .flashcard-card');
    if (cards.length === 0) return;
    
    // Check if any card is flipped
    const anyFlipped = Array.from(cards).some(card => card.classList.contains('flipped'));
    
    cards.forEach(card => {
      if (anyFlipped) {
        card.classList.remove('flipped');
      } else {
        card.classList.add('flipped');
      }
    });
    
    showToast(anyFlipped ? 'Resetting to questions' : 'Revealing all answers', 'info');
  });

  // Copy and Download Buttons
  btnCopyAll.addEventListener('click', handleCopyAll);
  btnDownloadJson.addEventListener('click', handleDownloadJson);

  // Core Generate Action
  btnGenerate.addEventListener('click', handleGenerationRequest);

  // Load Demo Trigger
  document.body.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'btnLoadDemo') {
      loadDemoStudyDeck();
    }
  });
}

// ==========================================================================
// FILE HANDLER METHODS
// ==========================================================================
function handleUploadedFile(file) {
  if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
    showToast('Invalid file format. Please upload a .txt file.', 'error');
    return;
  }

  if (file.size > 2 * 1024 * 1024) { // 2MB Limit
    showToast('File is too large. Size limit is 2MB.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    state.uploadedFileContent = content;
    
    // Set text to textarea
    lessonContent.value = content;
    
    // Update word counter
    const wordCount = content.trim() === '' ? 0 : content.trim().split(/\s+/).length;
    wordCounter.textContent = `${wordCount.toLocaleString()} / 2,000 words`;
    
    // Update Banner UI
    fileName.textContent = file.name;
    fileSize.textContent = formatBytes(file.size);
    dropZone.classList.add('hidden');
    fileBanner.classList.remove('hidden');
    
    showToast('File uploaded successfully.', 'success');
  };
  
  reader.onerror = () => {
    showToast('Failed to read the file.', 'error');
  };
  
  reader.readAsText(file);
}

function removeUploadedFile() {
  state.uploadedFileContent = '';
  fileInput.value = '';
  dropZone.classList.remove('hidden');
  fileBanner.classList.add('hidden');
  showToast('File removed.', 'info');
}

function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// ==========================================================================
// VIEW TAB NAVIGATION
// ==========================================================================
function switchTab(tabId) {
  state.activeTab = tabId;
  
  // Update Tabs UI
  tabButtons.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update Pane Visibility
  tabPanes.forEach(pane => {
    const paneId = pane.id;
    if (paneId === `paneFlashcards` && tabId === 'flashcards' ||
        paneId === `paneConcepts` && tabId === 'concepts' ||
        paneId === `paneRevision` && tabId === 'revision') {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });
}

// ==========================================================================
// GENERATION API CALL MANAGER
// ==========================================================================
async function handleGenerationRequest() {
  const contentText = lessonContent.value.trim();
  
  if (!contentText) {
    showToast('Please enter some lesson notes or upload a text file.', 'warning');
    return;
  }
  
  const wordCount = contentText.split(/\s+/).length;
  if (wordCount < 10) {
    showToast('Text is too short. Please provide at least 10 words of content.', 'warning');
    return;
  }

  // Pre-loading states
  setLoadingState(true);
  let timer;
  let progress = 0;
  
  // Progress bar animation simulator
  timer = setInterval(() => {
    if (progress < 90) {
      progress += Math.floor(Math.random() * 8) + 2;
      setLoadingProgress(progress, getLoadingMessage(progress));
    }
  }, 350);

  try {
    let result = null;
    
    if (state.connectionMode === 'direct') {
      if (!state.apiKey) {
        setLoadingState(false);
        clearInterval(timer);
        settingsModal.classList.remove('hidden');
        showToast('API Key is missing. Please save your key in the settings panel.', 'error');
        return;
      }
      result = await generateDirectFromClient(contentText, state.activeOption, state.apiKey);
    } else {
      result = await generateFromProxyServer(contentText, state.activeOption);
    }
    
    // Parse mapping corrections for server's "revisionNotes" VS requested "revisionCards"
    if (result && result.revisionNotes && !result.revisionCards) {
      result.revisionCards = result.revisionNotes;
      delete result.revisionNotes;
    }
    
    // Schema verification
    validateResultSchema(result);

    // Save and render
    state.generatedData = result;
    clearInterval(timer);
    setLoadingProgress(100, 'Finishing setup...');
    
    setTimeout(() => {
      renderRevisionDeck(result);
      setLoadingState(false);
      showToast('Revision deck generated successfully!', 'success');
    }, 400);

  } catch (error) {
    clearInterval(timer);
    setLoadingState(false);
    console.error(error);
    showToast(`Generation failed: ${error.message || 'Unknown network error'}`, 'error');
  }
}

function getLoadingMessage(progress) {
  if (progress < 25) return 'Parsing document structure...';
  if (progress < 50) return 'Extracting core key terms...';
  if (progress < 75) return 'Creating active-recall questions...';
  return 'Synthesizing revision summaries...';
}

function setLoadingState(isLoading) {
  if (isLoading) {
    btnGenerate.disabled = true;
    btnGenerate.querySelector('.btn-text').classList.add('hidden');
    btnGenerate.querySelector('.btn-loader').classList.remove('hidden');
    btnGenerate.querySelector('.btn-arrow').classList.add('hidden');
    
    stateEmpty.classList.remove('active');
    stateResults.classList.remove('active');
    stateResults.classList.add('hidden');
    stateLoading.classList.add('active');
    outputActions.classList.add('hidden');
    tabsNavigation.classList.add('hidden');
  } else {
    btnGenerate.disabled = false;
    btnGenerate.querySelector('.btn-text').classList.remove('hidden');
    btnGenerate.querySelector('.btn-loader').classList.add('hidden');
    btnGenerate.querySelector('.btn-arrow').classList.remove('hidden');
    
    stateLoading.classList.remove('active');
  }
}

function setLoadingProgress(percent, statusText) {
  loadingProgress.style.width = `${percent}%`;
  loadingStatusText.textContent = statusText;
}

// schema structural enforcement checks
function validateResultSchema(data) {
  if (!data) throw new Error('Received an empty response from AI.');
  if (!Array.isArray(data.flashcards)) throw new Error('Response is missing a valid "flashcards" array.');
  if (!Array.isArray(data.keyConcepts)) throw new Error('Response is missing a valid "keyConcepts" array.');
  if (!Array.isArray(data.revisionCards)) throw new Error('Response is missing a valid "revisionCards" array.');
  
  if (data.flashcards.length === 0) throw new Error('Generations returned zero flashcards.');
}

// API Fetch #1: Local express server proxying
async function generateFromProxyServer(content, option) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, option })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${response.status}`);
  }

  return await response.json();
}

// API Fetch #2: Direct fetch API calls
async function generateDirectFromClient(content, option, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  let systemInstructionText = `You are an elite academic assistant and tutor. Your task is to process study materials, lesson notes, textbook chapter excerpts, or general educational documents, and convert them into three high-yield learning resource sections: Flashcards, Key Concepts, and Study/Revision Notes.`;
  if (option === 'exam-prep') {
    systemInstructionText += ' Focus heavily on potential exam topics, conceptual testing, definitions, and active recall. Ask deeper application questions in flashcards.';
  } else if (option === 'summarized') {
    systemInstructionText += ' Prioritize conciseness, quick reference, streamlined definitions, and high-impact cheat-sheet points.';
  }

  const prompt = `Please analyze the following study material and generate structured academic revision resources according to the specified JSON schema:

--- STUDY MATERIAL ---
${content}
--- END STUDY MATERIAL ---`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstructionText }] },
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          flashcards: {
            type: 'ARRAY',
            description: 'List of at least 10 revision flashcards with question and answer attributes mapping the central ideas of the material.',
            items: {
              type: 'OBJECT',
              properties: {
                question: { type: 'STRING', description: 'Active-recall question.' },
                answer: { type: 'STRING', description: 'Precise correct response.' }
              },
              required: ['question', 'answer']
            }
          },
          keyConcepts: {
            type: 'ARRAY',
            description: 'Key vocabulary terms, definitions, and analogies.',
            items: {
              type: 'OBJECT',
              properties: {
                term: { type: 'STRING', description: 'The topic, word, or framework.' },
                definition: { type: 'STRING', description: 'Textbook definition.' },
                explanation: { type: 'STRING', description: 'Intuitive real-world explanation or quick analogy.' }
              },
              required: ['term', 'definition', 'explanation']
            }
          },
          revisionCards: {
            type: 'ARRAY',
            description: 'Bullet summaries of key points.',
            items: { type: 'STRING' }
          }
        },
        required: ['flashcards', 'keyConcepts', 'revisionCards']
      }
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `API error ${response.status}`;
    throw new Error(errorMessage);
  }

  const result = await response.json();
  const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!rawText) {
    throw new Error('Gemini API did not return text content candidate.');
  }

  try {
    return JSON.parse(rawText.trim());
  } catch (parseError) {
    console.error('Failed to parse model output JSON:', rawText);
    throw new Error('Model response was not in a valid JSON structure.');
  }
}

// ==========================================================================
// RENDERERS
// ==========================================================================
function renderRevisionDeck(data) {
  // Toggle states
  stateResults.classList.remove('hidden');
  stateResults.classList.add('active');
  outputActions.classList.remove('hidden');
  tabsNavigation.classList.remove('hidden');

  // Set Counts
  flashcardCount.textContent = data.flashcards.length;
  conceptCount.textContent = data.keyConcepts.length;
  revisionCount.textContent = data.revisionCards.length;

  // 1. Render Flashcards Grid View
  flashcardsGridContainer.innerHTML = '';
  data.flashcards.forEach((card, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'flashcard-card';
    cardEl.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <span class="card-label">Card ${index + 1}</span>
          <p class="card-text">${escapeHtml(card.question)}</p>
          <div class="card-action-hint">
            <i data-lucide="refresh-cw"></i> Click to flip
          </div>
        </div>
        <div class="card-back">
          <span class="card-label">Answer</span>
          <p class="card-text">${escapeHtml(card.answer)}</p>
          <div class="card-action-hint">
            <i data-lucide="refresh-cw"></i> Click to flip
          </div>
        </div>
      </div>
    `;
    
    // Click flip listener
    cardEl.addEventListener('click', () => {
      cardEl.classList.toggle('flipped');
    });

    flashcardsGridContainer.appendChild(cardEl);
  });

  // Reset Carousel Indexes
  state.carouselIndex = 0;
  if (state.viewMode === 'carousel') {
    renderCarouselCard();
  }

  // 2. Render Key Concepts
  conceptsContainer.innerHTML = '';
  data.keyConcepts.forEach(concept => {
    const conceptEl = document.createElement('div');
    conceptEl.className = 'concept-card';
    conceptEl.innerHTML = `
      <div class="concept-header">
        <h4 class="concept-title">${escapeHtml(concept.term)}</h4>
        <div class="concept-icon" title="Concept Term"><i data-lucide="hash"></i></div>
      </div>
      <p class="concept-definition">${escapeHtml(concept.definition)}</p>
      ${concept.explanation ? `<p class="concept-explanation"><strong>Analogy:</strong> ${escapeHtml(concept.explanation)}</p>` : ''}
    `;
    conceptsContainer.appendChild(conceptEl);
  });

  // 3. Render Revision Bullet Summaries
  revisionContainer.innerHTML = '';
  data.revisionCards.forEach(bullet => {
    const bulletEl = document.createElement('li');
    bulletEl.className = 'revision-note-item';
    bulletEl.innerHTML = `
      <div class="revision-marker"><i data-lucide="check"></i></div>
      <span class="revision-text">${escapeHtml(bullet)}</span>
    `;
    revisionContainer.appendChild(bulletEl);
  });

  // Refresh Lucide dynamic symbols
  lucide.createIcons();
  
  // Default to flashcard tab
  switchTab('flashcards');
}

// Carousel cards loader
function renderCarouselCard() {
  const cards = state.generatedData?.flashcards;
  if (!cards || cards.length === 0) return;

  const currentCard = cards[state.carouselIndex];
  
  // Render single flashcard structure
  carouselCardPlaceholder.innerHTML = `
    <div class="flashcard-card" id="carouselFlashcard">
      <div class="card-inner">
        <div class="card-front">
          <span class="card-label">Card ${state.carouselIndex + 1} of ${cards.length}</span>
          <p class="card-text">${escapeHtml(currentCard.question)}</p>
          <div class="card-action-hint">
            <i data-lucide="refresh-cw"></i> Click to flip
          </div>
        </div>
        <div class="card-back">
          <span class="card-label">Answer</span>
          <p class="card-text">${escapeHtml(currentCard.answer)}</p>
          <div class="card-action-hint">
            <i data-lucide="refresh-cw"></i> Click to flip
          </div>
        </div>
      </div>
    </div>
  `;

  // Flip trigger listener
  const innerCard = document.getElementById('carouselFlashcard');
  innerCard.addEventListener('click', () => {
    innerCard.classList.toggle('flipped');
  });

  // Setup buttons disabled state
  btnPrevCard.disabled = state.carouselIndex === 0;
  btnNextCard.disabled = state.carouselIndex === cards.length - 1;

  // Setup Carousel indicators
  const progressPercent = ((state.carouselIndex + 1) / cards.length) * 100;
  carouselProgressBar.style.width = `${progressPercent}%`;
  carouselCardIndex.textContent = `Card ${state.carouselIndex + 1} of ${cards.length}`;

  lucide.createIcons();
}

// ==========================================================================
// UTILITIES (HTML Escapes, Copy, Download JSON)
// ==========================================================================
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function handleCopyAll() {
  const data = state.generatedData;
  if (!data) return;

  let textBuffer = `=========================================\n`;
  textBuffer += `  SYNAPSE AI REVISION DECK GENERATION    \n`;
  textBuffer += `=========================================\n\n`;

  textBuffer += `--- FLASHCARDS [${data.flashcards.length}] ---\n`;
  data.flashcards.forEach((card, index) => {
    textBuffer += `Q${index + 1}: ${card.question}\nA${index + 1}: ${card.answer}\n\n`;
  });

  textBuffer += `--- KEY CONCEPTS [${data.keyConcepts.length}] ---\n`;
  data.keyConcepts.forEach((concept) => {
    textBuffer += `Term: ${concept.term}\nDef:  ${concept.definition}\n`;
    if (concept.explanation) textBuffer += `Explanation: ${concept.explanation}\n`;
    textBuffer += `\n`;
  });

  textBuffer += `--- REVISION SUMMARY BULLETS [${data.revisionCards.length}] ---\n`;
  data.revisionCards.forEach((bullet) => {
    textBuffer += `• ${bullet}\n`;
  });

  navigator.clipboard.writeText(textBuffer)
    .then(() => showToast('Revision content copied to clipboard!', 'success'))
    .catch((err) => {
      console.error(err);
      showToast('Copy failed. Please try again.', 'error');
    });
}

function handleDownloadJson() {
  const data = state.generatedData;
  if (!data) return;

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `synapse_revision_deck_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast('JSON Deck downloaded.', 'success');
}

// ==========================================================================
// DEMO DECK FALLBACK GENERATOR
// ==========================================================================
const MOCK_DEMO_DATA = {
  flashcards: [
    { question: "What is cellular respiration?", answer: "The process by which cells convert biochemical energy from nutrients into ATP and release waste products." },
    { question: "Where does Glycolysis occur in the cell?", answer: "Glycolysis takes place in the cytoplasm of the cell." },
    { question: "Is Glycolysis an aerobic or anaerobic process?", answer: "It is an anaerobic process, meaning it does not require oxygen to proceed." },
    { question: "What are the net products of Glycolysis?", answer: "A net yield of 2 ATP molecules, 2 NADH molecules, and 2 pyruvate molecules per glucose." },
    { question: "Where does the Krebs Cycle occur within the mitochondria?", answer: "The Krebs Cycle occurs in the fluid-filled mitochondrial matrix." },
    { question: "What molecule enters the Krebs Cycle after pyruvate oxidation?", answer: "Acetyl-CoA." },
    { question: "Where does Oxidative Phosphorylation take place?", answer: "On the folded inner mitochondrial membrane (cristae)." },
    { question: "What role does ATP Synthase play in cellular energy generation?", answer: "It acts as a molecular turbine, utilizing the proton gradient to convert ADP and inorganic phosphate into ATP." },
    { question: "How many ATP molecules are typically generated by aerobic respiration per glucose?", answer: "Approximately 36 to 38 ATP molecules under optimal conditions." },
    { question: "What serves as the final electron acceptor in the Electron Transport Chain?", answer: "Oxygen (O2), which combines with protons to form water (H2O)." }
  ],
  keyConcepts: [
    { term: "Adenosine Triphosphate (ATP)", definition: "The primary energy currency of the cell, storing and transporting chemical energy for metabolic processes.", explanation: "Think of ATP as a rechargeable battery that powers all the electrical machinery in your house." },
    { term: "Glycolysis", definition: "A 10-step metabolic pathway that splits one glucose molecule into two pyruvates, producing a net yield of 2 ATP and 2 NADH.", explanation: "Like breaking a large $100 bill into two $50 bills to make it easier to spend." },
    { term: "Krebs Cycle", definition: "A cyclic sequence of reactions in the mitochondrial matrix that oxidizes Acetyl-CoA to produce CO2, ATP, NADH, and FADH2.", explanation: "A merry-go-round that takes fuel, extracts high-energy electrons, and releases exhaust (carbon dioxide)." },
    { term: "Proton-Motive Force", definition: "An electrochemical gradient established across the inner mitochondrial membrane by pumping H+ protons into the intermembrane space.", explanation: "Think of it like water stored behind a hydroelectric dam, ready to flow and generate electricity." },
    { term: "ATP Synthase", definition: "A complex enzyme structure that utilizes the proton flow to catalyze the synthesis of ATP from ADP and inorganic phosphate.", explanation: "A tiny turbine wheel driven by water (protons) that stamps out products (ATP) as it spins." }
  ],
  revisionCards: [
    "Cellular respiration is a catabolic pathway that breaks glucose down into CO2 and H2O to synthesize high-yield ATP.",
    "Glycolysis splits glucose (6C) into two pyruvates (3C) anaerobically in the cytoplasm, yielding a net of 2 ATP.",
    "The Krebs Cycle oxidizes Acetyl-CoA in the mitochondrial matrix, creating CO2 waste and loading NADH/FADH2 electron carriers.",
    "The Electron Transport Chain (ETC) uses electron energy to pump protons, forming an electrochemical gradient across the cristae.",
    "Chemiosmosis describes protons flowing back through ATP Synthase, which drives the production of 32-34 ATP molecules.",
    "Oxygen is essential as the terminal electron acceptor; without it, the ETC stalls, stopping aerobic ATP synthesis."
  ]
};

function loadDemoStudyDeck() {
  setLoadingState(true);
  let progress = 0;
  
  // Custom quick loading progress simulation
  const demoTimer = setInterval(() => {
    if (progress < 100) {
      progress += 25;
      setLoadingProgress(progress, progress === 100 ? 'Rendering study deck...' : 'Synthesizing demo concepts...');
    } else {
      clearInterval(demoTimer);
      state.generatedData = MOCK_DEMO_DATA;
      renderRevisionDeck(MOCK_DEMO_DATA);
      setLoadingState(false);
      
      // Focus textarea with demo text for complete realism
      lessonContent.value = `Cellular respiration is the process by which cells convert biochemical energy from nutrients into ATP... [Loaded from Demo Preset]`;
      const wordCount = lessonContent.value.split(/\s+/).length;
      wordCounter.textContent = `${wordCount} / 2,000 words`;
      
      showToast('Demo study deck loaded! Explore the cards, key concepts, and summaries.', 'success');
    }
  }, 150);
}

// Boot
window.addEventListener('DOMContentLoaded', init);

