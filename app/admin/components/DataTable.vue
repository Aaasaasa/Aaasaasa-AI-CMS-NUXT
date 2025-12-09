<script setup lang="ts">
const props = defineProps<{ rows: any[] }>()
</script>
<template>
  <table>
    <tr v-for="(r, i) in props.rows" :key="i">
      <td v-for="(v, k) in r" :key="k">{{ v }}</td>
    </tr>
  </table>
</template>
