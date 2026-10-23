import { processTextPipeline, calculateReadability, divideWordIntoSyllables } from './src/services/simplification.service.js';

console.log('=== TESTING DYSLEXIA SIMPLIFICATION PIPELINE ===');

const complexSample = `Photosynthesis is a fundamental biological phenomenon wherein green plants utilize solar radiation to synthesize organic carbohydrates. Furthermore, this intricate biochemical reaction takes place predominantly within specialized cellular organelles known as chloroplasts. Consequently, in order to facilitate the conversion of photonic energy, chloroplasts generate adenosine triphosphate.`;

console.log('\n--- 1. Testing Readability on Raw Text ---');
const rawReadability = calculateReadability(complexSample);
console.log('Raw text readability:', rawReadability);

console.log('\n--- 2. Testing Full Simplification Pipeline ---');
const result = processTextPipeline(complexSample, 'moderate');
console.log('Original Sentences count:', result.paragraphs[0]?.stats?.originalSentenceCount);
console.log('Simplified Sentences count:', result.paragraphs[0]?.stats?.simplifiedSentenceCount);
console.log('Original Grade:', result.readabilityScore.originalGrade);
console.log('Simplified Grade:', result.readabilityScore.fleschKincaidGrade);
console.log('Reading Ease score:', result.readabilityScore.fleschReadingEase);
console.log('Flagged Difficult Words count:', result.difficultWords.length);
console.log('Difficult words:', result.difficultWords.map(w => `${w.word} (${w.syllables?.join('·')}) -> ${w.simplifiedWord}`));

console.log('\n--- 3. Testing Syllable Breakdown ---');
const testWords = ['photosynthesis', 'comprehension', 'chloroplasts', 'consequently', 'biological'];
testWords.forEach(w => {
  console.log(`${w} ->`, divideWordIntoSyllables(w).join(' · '));
});

console.log('\n--- 4. Simplified Text Output ---');
console.log(result.simplifiedText);

console.log('\n=== TEST COMPLETED SUCCESSFULLY ===');
