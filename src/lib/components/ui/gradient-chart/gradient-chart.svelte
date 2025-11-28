<script lang="ts">
  import * as Chart from "$lib/components/ui/chart/index.js";
  import { scaleUtc } from "d3-scale";
  import { curveNatural } from "d3-shape";
  import { Area, AreaChart, LinearGradient } from "layerchart";

  /**
   * Configuration for a single time series to display on the chart
   */
  export interface TimeSeriesConfig {
    /** Unique key for this series */
    key: string;
    /** Display label for the series */
    label: string;
    /** CSS color variable or color value */
    color?: string;
  }

  /**
   * A single data point with a date and numeric values for each series
   */
  export type TimeSeriesDataPoint = {
    date: Date;
    [key: string]: Date | number;
  };

  interface Props {
    /** Array of data points, each containing a date and values for each series */
    data: TimeSeriesDataPoint[];
    /** Configuration for each series to display */
    series: TimeSeriesConfig[];
    /** Whether to stack the series (default: false) */
    stacked?: boolean;
    /** Date format function for x-axis labels */
    xAxisFormat?: (date: Date) => string;
    /** Date format function for tooltip labels */
    tooltipLabelFormat?: (date: Date) => string;
  }

  let {
    data,
    series,
    stacked = false,
    xAxisFormat = (v: Date) => v.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    tooltipLabelFormat = (v: Date) => v.toLocaleDateString("en-US", { month: "long", day: "numeric" }),
  }: Props = $props();

  // Build chart config from series
  const chartConfig = $derived(
    series.reduce(
      (acc, s, i) => {
        acc[s.key] = {
          label: s.label,
          color: s.color ?? `var(--chart-${i + 1})`,
        };
        return acc;
      },
      {} as Chart.ChartConfig
    )
  );

  // Build series configuration for AreaChart
  const chartSeries = $derived(
    series.map((s, i) => ({
      key: s.key,
      label: s.label,
      color: s.color ?? `var(--color-${s.key})`,
    }))
  );
</script>

<Chart.Container config={chartConfig}>
  <AreaChart
    data={data}
    x="date"
    xScale={scaleUtc()}
    yPadding={[0, 25]}
    series={chartSeries}
    seriesLayout={stacked ? "stack" : "overlap"}
    props={{
      area: {
        curve: curveNatural,
        "fill-opacity": 0.4,
        line: { class: "stroke-1" },
        motion: "tween",
      },
      xAxis: {
        format: xAxisFormat,
      },
      yAxis: { format: () => "" },
    }}
  >
    {#snippet tooltip()}
      <Chart.Tooltip
        indicator="dot"
        labelFormatter={tooltipLabelFormat}
      />
    {/snippet}
    {#snippet marks({ series, getAreaProps })}
      {#each series as s, i (s.key)}
        <LinearGradient
          stops={[
            s.color ?? "",
            "color-mix(in lch, " + s.color + " 10%, transparent)",
          ]}
          vertical
        >
          {#snippet children({ gradient })}
            <Area {...getAreaProps(s, i)} fill={gradient} />
          {/snippet}
        </LinearGradient>
      {/each}
    {/snippet}
  </AreaChart>
</Chart.Container>
