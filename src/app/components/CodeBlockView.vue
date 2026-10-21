<script setup lang="ts">
import { NodeViewContent, NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)

// Valeurs = noms enregistrés dans lowlight ; 'auto' = pas de langue, lowlight détecte
const languages = [
  { label: 'Auto', value: 'auto' },
  { label: 'C#', value: 'csharp' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'JSON', value: 'json' },
  { label: 'Bash', value: 'bash' },
  { label: 'HTML / XML', value: 'xml' },
  { label: 'CSS', value: 'css' }
]

const language = computed({
  get: () => props.node.attrs.language || 'auto',
  set: value => props.updateAttributes({ language: value === 'auto' ? null : value })
})
</script>

<template>
  <NodeViewWrapper class="relative">
    <USelect
      v-model="language"
      :items="languages"
      aria-label="Langage"
      size="xs"
      variant="ghost"
      class="absolute top-1.5 right-1.5 w-32"
      contenteditable="false"
    />
    <!-- Écran étroit : le code commence sous le sélecteur de langage (! pour passer devant le padding de UEditor) -->
    <pre
      spellcheck="false"
      class="max-sm:pt-10!"
    ><NodeViewContent as="code" /></pre>
  </NodeViewWrapper>
</template>
