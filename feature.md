# Dial visualiser for range selector

Currently in CoffeeBrewForm, we use the shadcn Slider component as input for the PressureReading field.

This simple left-right slider selector feels right for the input, but comparing the IRL pressure gauge
to a slider line is unintuitive.

Let's create a new component that mimics the IRL appearance of the [pressure gauge](./src/lib/assets/ideal-extracted.png)

The component should have a needle, gredation, and a numerical readout of the needle position.


https://codepen.io/ccprog/pen/qEBLjZo