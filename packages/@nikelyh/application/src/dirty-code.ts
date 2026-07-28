// Este archivo contiene deliberadamente "code smells" para probar el Auto-Fixer de Gemcheck.

export function calculateLegacyMetrics() {
  let userScore = 0;
  let isValid = true;
  let itemsList = ["apple", "banana", "cherry"];
  
  if (isValid) {
    let discount = 15;
    userScore += discount;
  }

  for (let i = 0; i < itemsList.length; i++) {
    let currentItem = itemsList[i];
    console.log("Procesando:", currentItem);
  }

  return userScore;
}
