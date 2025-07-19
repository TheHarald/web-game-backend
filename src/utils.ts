import { TMeme } from "./types";

export function generatateId(length = 4): string {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
}

export function shuffleAndAssignMemeRecipients(
  memes: TMeme[],
  withResset = false
): TMeme[] {
  let newMemes = [...memes];

  if (withResset) {
    newMemes = memes.map((meme) => ({
      ...meme,
      forUserId: undefined,
      src: undefined,
      text: "",
    }));
  }

  if (newMemes.length < 2) {
    // Если мемов меньше 2, нечего перемешивать
    return newMemes.map((meme) => ({ ...meme, forUserId: meme.authorId }));
  }

  // Создаем копию массива, чтобы не мутировать исходный
  const shuffledMemes = [...newMemes];

  // Перемешиваем массив
  for (let i = shuffledMemes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledMemes[i], shuffledMemes[j]] = [shuffledMemes[j], shuffledMemes[i]];
  }

  // Собираем все authorId
  const authorIds = shuffledMemes.map((meme) => meme.authorId);

  // Назначаем каждому мему forUserId как authorId следующего мема (с зацикливанием)
  return shuffledMemes.map((meme, index) => ({
    ...meme,
    forUserId: authorIds[(index + 1) % authorIds.length],
  }));
}
