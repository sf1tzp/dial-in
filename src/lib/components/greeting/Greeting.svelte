<script lang="ts">
    import Sun from "@lucide/svelte/icons/sun";
    import Sunrise from "@lucide/svelte/icons/sunrise";
    import Sunset from "@lucide/svelte/icons/sunset";
    import MoonStar from "@lucide/svelte/icons/moon-star";

    type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

    const greetings: Record<TimeOfDay, string[]> = {
        morning: [
            "Rise and grind!",
            "Fresh beans, fresh start.",
            "Time to brew some magic.",
            "Good morning, engineer.",
            "Let's get this code brewing.",
        ],
        day: [
            "Keep the momentum going.",
            "Fuel your focus.",
            "Another cup, another feature.",
            "Peak productivity hours.",
            "Stay caffeinated, stay sharp.",
        ],
        evening: [
            "Winding down the day.",
            "One more cup for the road?",
            "Review the day's brews.",
            "Evening debugging session.",
            "Savor the sunset sip.",
        ],
        night: [
            "Burning the midnight oil?",
            "Decaf might be wise.",
            "Night owl mode activated.",
            "Late night commits ahead.",
            "Rest well, brew better tomorrow.",
        ],
    };

    function getTimeOfDay(date: Date = new Date()): TimeOfDay {
        const hour = date.getHours();
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'day';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    }

    function getGreeting(timeOfDay: TimeOfDay): string {
        const messages = greetings[timeOfDay];
        const index = Math.floor(Math.random() * messages.length)
        return messages[index];
    }

    const timeOfDay = getTimeOfDay();
    const greeting = getGreeting(timeOfDay);

    const iconProps = { class: "size-16 md:size-20" };
</script>

<div class="flex flex-col items-center gap-4 text-center">
    <div class="text-primary">
        {#if timeOfDay === 'morning'}
            <Sunrise {...iconProps} />
        {:else if timeOfDay === 'day'}
            <Sun {...iconProps} />
        {:else if timeOfDay === 'evening'}
            <Sunset {...iconProps} />
        {:else}
            <MoonStar {...iconProps} />
        {/if}
    </div>
    <h1 class="text-3xl font-bold tracking-tight md:text-5xl">
        {greeting}
    </h1>
</div>

