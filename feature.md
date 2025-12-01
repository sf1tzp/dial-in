# Feature: Provide a way to edit or remove entries from the timeline

This feature should add 'edit' and 'delete' buttons to the bag and brew entries on the cofeetimeline.

Let's use the lucide `<Pencil />` icon for our edit Button and `<Trash2 />` for the delete Button.

## Enhancement: Cascade Delete Bags

When deleting a coffee bag, we should also delete the associated brews.

We should provide an additional warning text when deleting a bag:

> Warning! Deleting this Bag will also delete it's associated Brews!
> You can change the Bag associated with a Brew by editing that brew

(the wording of this warning is not yet finalized..)