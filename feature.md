# Feature: Provide a way to edit or remove entries from the timeline

This feature should add 'edit' and 'delete' buttons to the bag and brew entries on the cofeetimeline.

Let's use the lucide `<Pencil />` icon for our edit Button and `<Trash2 />` for the delete Button.

## Enhancement: Cascade Delete Bags

When deleting a coffee bag, we should also delete the associated brews.

We should provide an additional warning text when deleting a bag:

> Warning! Deleting this Bag will also delete it's associated Brews!
> You can change the Bag associated with a Brew by editing that brew

(the wording of this warning is not yet finalized..)


## Enhancement: Integrate CSS Swiper component

### Part 1

[swiper](./swiper/) contains codepen files for a primarily-CSS-based swiper component provides smooth, consistent behavior on mobile devices.

Let's encapsualte this into a reusable svelte component `./src/lib/components/ui/swiper`

We should allow users of this component to specify whether to use the "hold" varient

We should also allow users to specify the color and icon and optional label to be used on each side of the swiper.


### Part 2

Let's integrate this new component into coffee timeline. Each element in the timeline should use this component:
- Swiping "to the right" should reveal the delete button
- Swiping "to the left" should trigger the edit dialog


