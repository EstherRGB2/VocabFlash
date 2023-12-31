async function getDefinition() {
  const wordInput = document.getElementById('wordInput').value.trim();
  if (wordInput === '') {
    alert('Please enter a word.');
    return;
  }

  const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${wordInput}`);
  const data = await response.json();

  if (response.ok && data.length > 0) {
    const definition = data[0].meanings[0].definitions[0].definition;
    displayDefinition(definition);
  } else {
    displayDefinition('Definition not found.');
  }
}
function displayDefinition(definition) {
  const flashcard = document.getElementById('flashcard');
  const definitionElement = document.getElementById('definition');

  definitionElement.textContent = definition;
  flashcard.style.backgroundColor = '#ffffff';
}