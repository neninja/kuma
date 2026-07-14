<script setup lang="ts">
import { computed, ref } from 'vue';

const clicks = ref(0);

const status = computed(() => {
  if (clicks.value === 0) {
    return 'idle';
  }

  if (clicks.value < 5) {
    return 'active';
  }

  return 'ready';
});

function increment() {
  clicks.value += 1;
}

function reset() {
  clicks.value = 0;
}
</script>

<template>
  <main class="shell">
    <section class="panel">
      <div class="heading">
        <p>Kuma workspace</p>
        <h1>Lit button inside Vue</h1>
      </div>

      <div class="metrics" aria-label="Button state">
        <span>
          <strong>{{ clicks }}</strong>
          clicks
        </span>
        <span>
          <strong>{{ status }}</strong>
          state
        </span>
      </div>

      <div class="actions">
        <kuma-button variant="primary" @click="increment">
          Add click
        </kuma-button>
        <kuma-button variant="secondary" @click="reset">
          Reset
        </kuma-button>
      </div>
    </section>
  </main>
</template>
