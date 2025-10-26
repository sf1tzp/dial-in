# Storage considerations

We will allow the user to track two main types of events and various metadata. We will support create/update/delete operations for each

we will offer two options for data storage
- On device / browser storage (potentially limited in terms of size?)
- Opt in integration with backend API & Database

We are targeting a PWA-style experience for mobile web. Users should be able to use local offline storage compeltely free. Users may opt in to account creation and receive these optional benefits
- 1 Year data retention
- Sharable Profile
- Special CSS elements
- Graph and Statistics views


## Primary Data Types

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


## Implementation Strategy

We aim to utilize gRPC to define a consistent typing between our front and back ends

We prefer to avoid ORMs on the server

We will leverage PWA storage APIs to persist user data on their device

