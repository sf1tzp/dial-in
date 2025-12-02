<script lang="ts">
  import CalendarPlus from "@lucide/svelte/icons/calendar-plus";
  import {
    type DateValue,
    getLocalTimeZone,
    CalendarDate,
    today,
  } from "@internationalized/date";
  import { cn } from "$lib/utils.js";
  import { formatColloquialDate } from "$lib/dates.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Calendar } from "$lib/components/ui/calendar/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import Heater from "@lucide/svelte/icons/heater";

  interface Props {
    value?: Date;
    onchange?: (date: Date | undefined) => void;
    placeholder?: string;
    label?: string;
    id?: string;
    "aria-invalid"?: "true" | undefined;
  }

  let { value: dateValue, onchange, placeholder = "Unknown", label, id, "aria-invalid": ariaInvalid }: Props = $props();

  // Disallow future dates
  const maxValue = today(getLocalTimeZone());

  // Convert JS Date to DateValue
  function toDateValue(date: Date | undefined): DateValue | undefined {
    if (!date) return undefined;
    return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }

  // Convert DateValue to JS Date
  function toDate(dateValue: DateValue | undefined): Date | undefined {
    if (!dateValue) return undefined;
    return dateValue.toDate(getLocalTimeZone());
  }

  let calendarValue = $state<DateValue | undefined>(toDateValue(dateValue));

  // Sync external value changes
  $effect(() => {
    calendarValue = toDateValue(dateValue);
  });

  function handleValueChange(v: DateValue | undefined) {
    calendarValue = v;
    onchange?.(toDate(v));
  }

  function getDisplayText(): string {
    if (!calendarValue) {
      return "";
    }
    const formattedDate = formatColloquialDate(calendarValue.toDate(getLocalTimeZone()));
    return formattedDate;
  }
</script>

<Popover.Root>
  <Popover.Trigger>
    {#snippet child({ props })}
      <Button
        {id}
        variant="outline"
        class={cn(
          !calendarValue && "text-muted-foreground"
        )}
        aria-invalid={ariaInvalid}
        {...props}
      >

        {#if !calendarValue}
          <span class="text-muted-foreground text-sm">{placeholder}</span>
        {:else}
          <!--  -->
          {#if id == "dateRoasted"}
            <Heater class="size-4 text-muted-foreground" />
            <span class="text-muted-foreground text-sm">Roasted:</span>
          {:else if id == "dateOpened"}
            <span class="text-muted-foreground text-sm">Opened:</span>
          {/if}
        {/if}

        {getDisplayText()}
        {#if !calendarValue}
          <CalendarPlus class="size-4" />
        {/if}
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-auto p-0">
    <Calendar
      value={calendarValue}
      onValueChange={handleValueChange}
      type="single"
      initialFocus
      captionLayout="dropdown"
      {maxValue}
    />
  </Popover.Content>
</Popover.Root>