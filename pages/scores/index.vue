<script setup lang="ts">
const today = new Date().toLocaleDateString('en-CA')

await navigateTo(`/scores/${today}`, { replace: true })
</script>
