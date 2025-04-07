<script setup lang="ts">
import AppTile from './AppTile.vue';
</script>

<template>
    <p class="subheading">Guess the Wordle in 6 tries.</p>
    <section class="help">
        <ul class="instructions">
            <li>Each guess must be a valid 5-letter word.</li>
            <li>The color of the tiles will change to show how close your guess was to the word.</li>
        </ul>
        <div class="examples">
            <h3 class="bold">Examples</h3>
            <div 
                aria-label="wordy" 
                class="example" 
                role="group" 
                aria-roledescription="Example"
            >
                <div data-testid="wordy-letter" class="tileContainer"><AppTile class="small" aria-label="1st letter, W, correct" data-state="correct" data-animation="flip-in">w</AppTile></div>
                <div data-testid="wordy-letter" class="tileContainer"><AppTile class="small" aria-label="2nd letter, O" data-state="tbd" data-animation="idle">o</AppTile></div>
                <div data-testid="wordy-letter" class="tileContainer"><AppTile class="small" aria-label="3rd letter, R" data-state="tbd" data-animation="idle">r</AppTile></div>
                <div data-testid="wordy-letter" class="tileContainer"><AppTile class="small" aria-label="4th letter, D" data-state="tbd" data-animation="idle">d</AppTile></div>
                <div data-testid="wordy-letter" class="tileContainer"><AppTile class="small" aria-label="5th letter, Y" data-state="tbd" data-animation="idle">y</AppTile></div>
                <p><strong>W</strong> is in the word and in the correct spot.</p>
            </div>
            <div 
                aria-label="light" 
                class="example" 
                role="group" 
                aria-roledescription="Example"
            >
                <div data-testid="light-letter" class="tileContainer"><AppTile class="small" aria-label="1st letter, L" data-state="tbd" data-animation="idle">l</AppTile></div>
                <div data-testid="light-letter" class="tileContainer"><AppTile class="small" aria-label="2nd letter, I, present in another position" data-state="present" data-animation="flip-in">i</AppTile></div>
                <div data-testid="light-letter" class="tileContainer"><AppTile class="small" aria-label="3rd letter, G" data-state="tbd" data-animation="idle">g</AppTile></div>
                <div data-testid="light-letter" class="tileContainer"><AppTile class="small" aria-label="4th letter, H" data-state="tbd" data-animation="idle">h</AppTile></div>
                <div data-testid="light-letter" class="tileContainer"><AppTile class="small" aria-label="5th letter, T" data-state="tbd" data-animation="idle">t</AppTile></div>
                <p><strong>I</strong> is in the word but in the wrong spot.</p>
            </div>
            <div 
                aria-label="rogue" 
                class="example" 
                role="group" 
                aria-roledescription="Example"
            >
                <div data-testid="rogue-letter" class="tileContainer"><AppTile class="small" aria-label="1st letter, R" data-state="tbd" data-animation="idle">r</AppTile></div>
                <div data-testid="rogue-letter" class="tileContainer"><AppTile class="small" aria-label="2nd letter, O" data-state="tbd" data-animation="idle">o</AppTile></div>
                <div data-testid="rogue-letter" class="tileContainer"><AppTile class="small" aria-label="3rd letter, G" data-state="tbd" data-animation="idle">g</AppTile></div>
                <div data-testid="rogue-letter" class="tileContainer"><AppTile class="small" aria-label="4th letter, U, absent" data-state="absent" data-animation="flip-in">u</AppTile></div>
                <div data-testid="rogue-letter" class="tileContainer"><AppTile class="small" aria-label="5th letter, E" data-state="tbd" data-animation="idle">e</AppTile></div>
                <p><strong>U</strong> is not in the word in any spot.</p>
            </div>
        </div>
        <div class="reminder"><p>A new puzzle is loaded every page refresh.</p></div>
    </section>
</template>

<style scoped lang="scss">
.help {
  width: 100%;
  margin: auto;
}

.subheading {
  font-family: 'nyt-karnak';
  font-weight: 500;
  font-size: 20px;
  line-height: 24px;
  margin: 0;
}

.instructions {
  font-family: 'nyt-franklin';
  font-size: 16px;
  line-height: 20px;
  list-style-type: disc;
  font-weight: 500;
  margin-block-start: 1em;
  margin-block-end: 1em;
  padding-inline-start: 20px; // TODO: NONDIRECTIONAL SPACING TOKEN REQUIRED
  color: var(--color-tone-1);

  li {
    margin-bottom: var(--vertical-spacing-0-5);
  }

  li::marker {
    font-size: 18px;
  }
}

.examples {
  font-family: 'nyt-franklin';
  border-bottom: 1px solid var(--gray-3);

  strong {
    font-weight: bold;
  }

  p,
  h3 {
    margin: 0;
    font-size: 16px;
    line-height: 20px;

    &.bold {
      font-weight: bold;
    }
  }
}

.example {
  margin-top: var(--vertical-spacing-1);
  margin-bottom: var(--vertical-spacing-2-5);

  p {
    font-size: 16px;
    line-height: 20px;
    margin-top: var(--vertical-spacing-1);
  }
}

.tileContainer {
  display: inline-block;
  width: 32px;
  height: 32px;
  margin-right: var(--horizontal-spacing-0-5);
}

.reminder {
  font-family: 'nyt-franklin';
  font-size: 16px;
  line-height: 20px;
  margin-top: var(--vertical-spacing-2-5);
}

@media (max-width: 295px) {
  .tileContainer {
    height: 32px;
  }
}
</style>
