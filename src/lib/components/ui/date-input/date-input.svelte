<script lang="ts">
  import CalendarPlus from "@lucide/svelte/icons/calendar-plus";
  import {
    type DateValue,
    DateFormatter,
    getLocalTimeZone,
    CalendarDate,
  } from "@internationalized/date";
  import { cn } from "$lib/utils.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Calendar } from "$lib/components/ui/calendar/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";

  interface Props {
    value?: Date;
    onchange?: (date: Date | undefined) => void;
    placeholder?: string;
    id?: string;
    "aria-invalid"?: "true" | undefined;
  }

  let { value: dateValue, onchange, placeholder = "Select a date", id, "aria-invalid": ariaInvalid }: Props = $props();

  const df = new DateFormatter("en-US", {
    dateStyle: "long",
  });

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
</script>

<Popover.Root>
  <Popover.Trigger>
    {#snippet child({ props })}
      <Button
        {id}
        variant="outline"
        class={cn(
          "w-full justify-start text-start text-3xl",
          !calendarValue && "text-muted-foreground"
        )}
        aria-invalid={ariaInvalid}
        {...props}
      >
        {calendarValue ? df.format(calendarValue.toDate(getLocalTimeZone())) : placeholder}
        <CalendarPlus class="ml-2 size-4" />
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
    />
  </Popover.Content>
</Popover.Root>