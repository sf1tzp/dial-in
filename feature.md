# Feature: Add detail components

In this feature, we'll add new detail components for viewing a Bag or Brew.

Photos provided to the app are not yet displayed anywhere. They should be displayed on the Timeline entries or on some kind of detailed view.

## User Story

When the user clicks on the main content of a BrewEntry or BagEntry, let's open a dialog card

This card will display the entry's photo (if applicable)

And the other data associated with the entry in a larger, more presentation-styled way.

## Notes

We have shadcn Dialog components in src/lib/components/ui/dialog

Let's place the dialog component in the Entry component, instead of adding another dialog in our main +page.svelte

## Enhancement: Interpoalate the brew's Created Date in the detail card title, eg "Saturday morning brew"

Note: The detail card's title is actually rendered in the Entry component
