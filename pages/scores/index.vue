<script setup lang="ts">
import { scoresDateForSeason } from '~/shared/utils/seasons'

const { seasonId, today, availableSeasons, withSeason } = useSeason()
const selected = availableSeasons.value.find((item) => item.id === seasonId.value)
const date = scoresDateForSeason(seasonId.value, selected?.lastGameDate ?? today.value, today.value)
await navigateTo(withSeason(`/scores/${date}`), { replace: true })
</script>
