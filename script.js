document.addEventListener('DOMContentLoaded', function () {
  const getDefinitionButton = document.querySelector('#wordInput + button');
  if (getDefinitionButton) {
    getDefinitionButton.addEventListener('click', getDefinition);
  }
});

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

// Function to handle study mode for a deck
function studyDeck(deckIndex) {
  const flashcard = document.getElementById('flashcard');
  let deck = getDecks()[deckIndex];
  let currentIndex = 0;
  let isDefinition = false;

  const nextWordButton = document.querySelector('.flashcard-navigation button:first-child');
  const buildButton = document.querySelector('.flashcard-navigation button:last-child');

  nextWordButton.addEventListener('click', () => {
    if (currentIndex < deck.words.length) {
      flashcard.textContent = isDefinition ? deck.words[currentIndex].word : deck.words[currentIndex].definition;
      isDefinition = !isDefinition;
      currentIndex++;
    } else {
      flashcard.textContent = 'No more words in this deck.';
    }
  });

  flashcard.addEventListener('click', () => {
    if (currentIndex <= deck.words.length) {
      if (isDefinition) {
        flashcard.textContent = deck.words[currentIndex - 1].word;
        isDefinition = false;
      } else {
        flashcard.textContent = deck.words[currentIndex - 1].definition;
        isDefinition = true;
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const getDefinitionButton = document.querySelector('#wordInput + button');
  if (getDefinitionButton) {
    getDefinitionButton.addEventListener('click', getDefinition);
  }

  const nextWordButton = document.querySelector('.flashcard-navigation button:first-child');
  if (nextWordButton) {
    nextWordButton.addEventListener('click', showNextWord);
  }

  const flashcard = document.getElementById('flashcard');
  flashcard.addEventListener('click', toggleWordDefinition); // Add click event listener for the flashcard
  displayFirstWord();
});

let currentIndex = 0;
let isDefinition = false; // Define outside the function to maintain state

// Function to display the first word from the deck when the page loads
function displayFirstWord() {
  let deck = getDecks().find((deck) => deck.name === 'MyDeck');
  const flashcard = document.getElementById('flashcard');

  if (deck && deck.words.length > 0) {
    flashcard.textContent = deck.words[0].word; // Display the first word
    isDefinition = true; // Start by showing the definition for the first word
    currentIndex = 1; // Update the index for subsequent words
  } else {
    flashcard.textContent = 'No words in this deck.';
  }
}

function showNextWord() {
  let deck = getDecks().find((deck) => deck.name === 'MyDeck');
  const flashcard = document.getElementById('flashcard');

  if (deck) {
    const { words } = deck;

    if (currentIndex < words.length) {
      flashcard.textContent = isDefinition ? words[currentIndex].word : words[currentIndex].definition;
      isDefinition = !isDefinition;
      currentIndex++;
    } else {
      flashcard.textContent = 'No more words in this deck.';
    }
  } else {
    flashcard.textContent = 'No deck found.';
  }
}

function toggleWordDefinition() {
  let deck = getDecks().find((deck) => deck.name === 'MyDeck');
  const flashcard = document.getElementById('flashcard');

  if (deck) {
    const { words } = deck;

    if (currentIndex <= words.length) {
      if (isDefinition) {
        flashcard.textContent = words[currentIndex - 1].word;
        isDefinition = false;
      } else {
        flashcard.textContent = words[currentIndex - 1].definition;
        isDefinition = true;
      }
    }
  } else {
    flashcard.textContent = 'No deck found.';
  }
}


  function removeFromDeck() {
    const currentWord = document.getElementById('flashcard').textContent.trim();

    if (currentWord === '' || currentWord === 'No more words in this deck.') {
      alert('No word to remove.');
      return;
    }

    let decks = getDecks();
    let myDeck = decks.find((deck) => deck.name === 'MyDeck');

    if (myDeck) {
      const wordIndex = myDeck.words.findIndex(
        (item) => item.word.toLowerCase() === currentWord.toLowerCase()
      );

      if (wordIndex !== -1) {
        myDeck.words.splice(wordIndex, 1); // Remove the word from the deck
        saveDecks(decks); // Save the updated deck to localStorage
        console.log('Word removed from the deck.');
        // Optionally update the display or perform any necessary actions after removal.
      } else {
        console.log('Word not found in the deck.');
        // Word not found in the deck; handle the case accordingly.
      }
    }
  }

function redirectToIndex() {
  // Redirect the user to index.html
  window.location.href = 'index.html';
}

function redirectTo_studyMode() {
  // Redirect the user to index.html
  window.location.href = 'studyMode.html';
}

// Display decks when the page loads
displayDecks();