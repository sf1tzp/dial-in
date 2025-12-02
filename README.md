# Dial In

Track brewing parameters and dial in the perfect brew.

## Screenshots

### Homepage

![Homepage screenshot](https://i.imgur.com/t9U9kKw.png)

### Statistics View

![Statistics view screenshot](https://i.imgur.com/Abw2oWp.png)

### Timeline View

![Timeline view screenshot](https://i.imgur.com/25YVc5h.png)

## Design Document

We will allow the user to track two main types of events and various metadata

- Opening a new bag of coffee:
  - Date roasted on
  - Date opened on
  - Name
  - Roaster name
  - Style
  - Notes
  - picture

- Brewing an Espresso:
  - Grinder coarseness
  - Grinder time setting
  - Dry weight
  - brew time
  - pressure gauge reading
  - pics
  - picture

We will provide a simple web UI, offering the user to record either a new bag or brew settings. Selecting either will open a mobile friendly form for the user to input the various metadata fields. Upon accepting the input, we will push a UI element to a scrollable 'timeline'.

In our UI, we will use intentional iconography to distinguish various concepts, including morning/day/night icons, and potentially weather iconography to add a sense of personality to our design.

### a11y and i18n

We will strive to follow modern A11y practices in our components.

It would be cool to support multiple translations of the app, because espresso is enjoyed all around the world.

## Storage

We are targeting a PWA-style experience for mobile web. Users should be able to use local offline storage compeltely free.

There are some durability concerns with browser local storage. [jakearchibald/idb/issues/299](https://github.com/jakearchibald/idb/issues/299)

We may later implement online features and offer these optional benefits:

- 1 Year data retention
- Sharable Profile
- Special CSS elements
- Graph and Statistics views

## Feature Planning & Enhancements:

### Feature: When scrolling down the timeline, we should hover some filter options at the top of the page, eg Bag Selector

The demo data presents a scenario with multiple interleaved bags & brews, which feels cluttered if you're trying to look at a specific set

### Feature: When the same Kind of Bag is added more than once, we need to use Opened-On date as a differentiator in Selector components

Users are fairly likely to order the same Kind of coffee again. Our app should account for this and track brews for each bag separately.

(Linking Bags of the same Kind of coffee is not in scope ATM)

### Feature: Use a virtual list to display the timeline

The timeline potentially contains hundreds of items, depending on activity. We can leverage a virtual list to reduce bottlenecks

### Feature: Allow user to supply Grind and Pressure Units and Scale

My grinder and esspresso machine do not have real units of measure. We scaffolded some settings
in `$lib/settings.ts`, but do not provide users a way to override the defaults. Supporting this
feature will allow the app to record more precice measurements for users with better equipment.

### Feature: Custom Grind Setting and Pressure Reading Input Components

I would really like to mimic the physical grinder dial and pressure gauge appearance in the app.

### Feature: Provide upstream data storage for persistence

idb cannot guarantee that data will not be evicted by the OS or Browser.
We should think about adding an export feature or implement serverside persistence.
[jakearchibald/idb/issues/299](https://github.com/jakearchibald/idb/issues/299)

We should warn users of the potential fragility of the default Browser storage,
and/or improve its robustness.

### Feature: The Brew Form should pre-select the previous grinder setting

It's annoying that this input defaults to "0". Once a user is 'dialed-in' it's less likely that they
will change the grinder setting.
