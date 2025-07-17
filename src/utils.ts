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

export function shuffleAndAssignMemeRecipients(memes: TMeme[]): TMeme[] {
  if (memes.length < 2) {
    // Если мемов меньше 2, нечего перемешивать
    return memes.map((meme) => ({ ...meme, forUserId: meme.authorId }));
  }

  // Создаем копию массива, чтобы не мутировать исходный
  const shuffledMemes = [...memes];

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
