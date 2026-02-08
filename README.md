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
