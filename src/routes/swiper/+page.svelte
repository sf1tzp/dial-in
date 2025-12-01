<script>
  import { Swiper } from '$lib/components/ui/swiper';
  import Trash2 from '@lucide/svelte/icons/trash-2';
  import Pencil from '@lucide/svelte/icons/pencil';
</script>

<Swiper
  hold
  left={{ color: 'red', icon: Trash2Icon,  }}
  right={{ color: 'green', icon: PencilIcon, }}
>
  <p>Swipeable content here</p>
</Swiper>

{#snippet Trash2Icon()}
  <Trash2 />
{/snippet}

{#snippet PencilIcon()}
  <Pencil />
{/snippet}