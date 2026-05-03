<script setup lang="ts">
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })

await navigateTo(`/scores/${today}`, { replace: true })
</script>
