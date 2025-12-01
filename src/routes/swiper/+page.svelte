<script>
  import { Swiper } from '$lib/components/ui/swiper';
</script>

<Swiper
  ondelete={() => console.log('Delete clicked')}
  onedit={() => console.log('Edit clicked')}
>
  <p>Swipeable content here</p>
</Swiper>