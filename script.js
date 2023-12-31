async function getDefinition() {
  const wordInput = document.getElementById('wordInput').value.trim();
  if (wordInput === '') {
    alert('Please enter a word.');
    return;
  }

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${wordInput}`);
    const data = await response.json();

    if (response.ok && data.length > 0) {
      const definition = data[0].meanings[0].definitions[0].definition;
      displayDefinition(definition);
      addToDeck(wordInput, definition); // Add the word and its definition to the deck
    } else {
      displayDefinition('Definition not found.');
    }
  } catch (error) {
    console.error('Error fetching definition:', error);
    displayDefinition('Failed to fetch definition.');
  }
}

function displayDefinition(definition) {
  const flashcard = document.getElementById('flashcard');
  const definitionElement = document.getElementById('definition');

  definitionElement.textContent = definition;
  flashcard.style.backgroundColor = '#ffffff';
}

function addToDeck(word, definition) {
  let decks = JSON.parse(localStorage.getItem('decks')) || [];

  let existingDeck = decks.find((deck) => deck.name === 'MyDeck');

  if (!existingDeck) {
    // Create a new deck if 'MyDeck' doesn't exist
    existingDeck = {
      name: 'MyDeck',
      words: [{ word: word.toLowerCase(), definition }],
    };
    decks.push(existingDeck);
    displayDecks();
  } else {
    // Check if the word already exists in the deck
    const wordIndex = existingDeck.words.findIndex(
      (item) => item.word === word.toLowerCase()
    );

    if (wordIndex === -1) {
      // Add word and its definition to the existing 'MyDeck'
      existingDeck.words.push({ word: word.toLowerCase(), definition });
    } else {
      console.log('Word already exists in the deck.');
      return; // Exit the function if the word already exists
    }
  }
  localStorage.setItem('decks', JSON.stringify(decks));
}

// Function to retrieve words from the deck
function getDeck() {
  let deck = JSON.parse(localStorage.getItem('wordDeck')) || [];
  return deck;
}

// Function to display the deck (for testing purposes)
function displayDeck() {
  const deck = getDeck();
  console.log('Word Deck:', deck);
}

// Function to display decks in the sidebar
function displayDecks() {
  const decksList = document.getElementById('decksList');
  decksList.innerHTML = ''; // Clear previous deck list

  const decks = getDecks();
  const myDeck = decks.find((deck) => deck.name === 'MyDeck');

  if (myDeck) {
    const deckItem = document.createElement('div');
    deckItem.innerHTML = `<div class="deck-item" data-deckindex="0">
                            <span>${myDeck.name}</span>
                            <input type="text" placeholder="Rename Deck" style="display:none;">
                            <button onclick="renameDeck(0)">Rename</button>
                            <button onclick="studyDeck(0)">Study</button>
                          </div>`;
    decksList.appendChild(deckItem);
  }
}

// Function to retrieve decks from localStorage
function getDecks() {
  let decks = JSON.parse(localStorage.getItem('decks')) || [];
  return decks;
}

// Function to save updated decks to localStorage
function saveDecks(decks) {
  localStorage.setItem('decks', JSON.stringify(decks));
}

// Function to handle renaming a deck
function renameDeck(index) {
  const deckItems = document.querySelectorAll('.deck-item');
  const inputField = deckItems[index].querySelector('input');
  const deckSpan = deckItems[index].querySelector('span');

  if (inputField.style.display === 'none') {
    deckSpan.style.display = 'none';
    inputField.style.display = 'block';
    inputField.value = deckSpan.textContent;
    inputField.focus();
  } else {
    const decks = getDecks();
    decks[index].name = inputField.value;
    saveDecks(decks);

    inputField.style.display = 'none';
    deckSpan.style.display = 'inline';
    deckSpan.textContent = inputField.value;

    displayDecks(); // Refresh the deck list after renaming
  }
}

// Display decks when the page loads
displayDecks();

// Update the displayDecks function to include "Study" button
function displayDecks() {
  const decksList = document.getElementById('decksList');
  decksList.innerHTML = ''; // Clear previous deck list

  const decks = getDecks();
  const myDeck = decks.find((deck) => deck.name === 'MyDeck');

  if (myDeck) {
    const deckItem = document.createElement('div');
    deckItem.innerHTML = `<div class="deck-item" data-deckindex="0">
                            <button onclick="studyDeck(0)">Study</button>
                          </div>`;
    decksList.appendChild(deckItem);
  }
}

// Function to handle study mode for a deck
function studyDeck(deckIndex) {
  const inputContainer = document.querySelector('.input-container');
  const flashcard = document.getElementById('flashcard');
  const studyButtons = document.createElement('div');
  studyButtons.classList.add('study-buttons');

  let deck = getDecks()[deckIndex];
  let currentIndex = 0;
  let isDefinition = false; // Flag to track if the definition is displayed

  const nextWordButton = document.createElement('button');
  nextWordButton.innerText = 'Next Word';

  const buildButton = document.createElement('button');
  buildButton.innerText = 'Build';
  buildButton.addEventListener('click', () => {
    inputContainer.innerHTML = `
      <label for="wordInput">Enter a Word:</label>
      <input type="text" id="wordInput" placeholder="Type a word...">
      <button onclick="getDefinition()">Get Definition</button>
    `;
    flashcard.innerHTML = '<p id="definition"></p>';
  });

  studyButtons.appendChild(nextWordButton);
  studyButtons.appendChild(buildButton);
  inputContainer.innerHTML = '';
  inputContainer.appendChild(studyButtons);

  nextWordButton.addEventListener('click', () => {
    if (currentIndex < deck.words.length) {
      flashcard.textContent = deck.words[currentIndex].word;
      isDefinition = false; // Reset the flag when showing the word
      currentIndex++;
    } else {
      flashcard.textContent = 'No more words in this deck.';
    }
  });

  flashcard.addEventListener('click', () => {
    if (currentIndex <= deck.words.length) {
      if (isDefinition) {
        flashcard.textContent = deck.words[currentIndex - 1].word;
        isDefinition = false; // Switch to display the word
      } else {
        flashcard.textContent = deck.words[currentIndex - 1].definition;
        isDefinition = true; // Switch to display the definition
      }
    }
  });
}