<script setup lang="ts">
const theme = useTheme()
const colorMode = useColorMode()

const modes = [
  { value: 'dark', label: 'Sombre', icon: 'i-lucide-moon' },
  { value: 'light', label: 'Clair', icon: 'i-lucide-sun' }
]
</script>

<template>
  <UPopover :content="{ align: 'end' }">
    <UButton
      icon="i-lucide-palette"
      color="neutral"
      variant="outline"
      size="sm"
      square
      class="rounded-full"
      aria-label="Thème"
    />

    <template #content>
      <div class="w-60 space-y-3 p-3">
        <div class="space-y-1">
          <span class="block text-xs font-semibold tracking-wider text-muted uppercase">Mode</span>
          <UTabs
            v-model="colorMode.preference"
            :items="modes"
            :content="false"
            size="xs"
            class="w-full"
          />
        </div>
        <div class="space-y-1">
          <span class="block text-xs font-semibold tracking-wider text-muted uppercase">Accents (Perso / Pro)</span>
          <UButton
            v-for="preset in themes"
            :key="preset.value"
            :label="preset.label"
            :trailing-icon="theme === preset.value ? 'i-lucide-check' : undefined"
            color="neutral"
            :variant="theme === preset.value ? 'soft' : 'ghost'"
            block
            :ui="{ label: 'flex-1 text-left' }"
            @click="theme = preset.value"
          >
            <template #leading>
              <span class="flex gap-1">
                <span
                  v-for="color in preset.swatch"
                  :key="color"
                  class="size-3 rounded-full"
                  :style="{ background: color }"
                />
              </span>
            </template>
          </UButton>
        </div>
      </div>
    </template>
  </UPopover>
</template>
