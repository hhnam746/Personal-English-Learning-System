export const partsOfSpeech = [
  ['noun', 'Danh từ'],
  ['verb', 'Động từ'],
  ['adjective', 'Tính từ'],
  ['adverb', 'Trạng từ'],
  ['phrase', 'Cụm từ'],
  ['other', 'Khác']
]

export function partOfSpeechLabel(value: string) {
  return partsOfSpeech.find(([key]) => key === value)?.[1] ?? value
}
