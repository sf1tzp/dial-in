# Dial In

Track various parameters and dial in the perfect brew.

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

Additionally, we will offer two options for data storage
- On device / browser storage (potentially limited in terms of size?)
- Opt in integration with backend API & Database


We are targeting a PWA-style experience for mobile web. Users should be able to use local offline storage compeltely free. Users may opt in to account creation and receive these optional benefits
- 1 Year data retention
- Sharable Profile
- Special CSS elements
- Graph and Statistics views



