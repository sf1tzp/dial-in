<script>
    import Card from "$lib/components/ui/card/card.svelte";
    import Dial from "$lib/components/ui/dial/dial.svelte";

    let pressureValue = $state(50);
</script>

<div class="max-w-4xl mx-auto p-4">
    <h1 class="text-2xl font-bold text-center mb-6">Pressure Gauge</h1>
    
    <div class="flex flex-col items-center gap-8">
        <Card class="p-6">
            <Dial 
                bind:value={pressureValue}
                min={0}
                max={100}
                step={1}
                unit="%"
                size={250}
            />
        </Card>
        
        <p class="text-muted-foreground text-center">
            Click or drag on the gauge to adjust the pressure reading.<br>
            Use arrow keys for fine control.
        </p>
    </div>
</div>
