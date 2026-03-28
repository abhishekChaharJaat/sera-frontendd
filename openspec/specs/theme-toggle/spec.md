### Requirement: Default to dark theme
The system SHALL apply dark mode as the default theme for all users on first visit, before any user preference is recorded.

#### Scenario: First visit with no saved preference
- **WHEN** a user visits the app for the first time with no `theme` key in localStorage
- **THEN** the dark theme SHALL be applied and visible immediately without any flash of light content

### Requirement: Toggle between dark and light themes
The system SHALL provide a toggle control in the top-right area of the navbar that switches the active theme between dark and light.

#### Scenario: User switches to light mode
- **WHEN** the user clicks the theme toggle button while dark mode is active
- **THEN** the theme SHALL switch to light mode immediately with a smooth CSS transition

#### Scenario: User switches back to dark mode
- **WHEN** the user clicks the theme toggle button while light mode is active
- **THEN** the theme SHALL switch to dark mode immediately with a smooth CSS transition

### Requirement: Persist theme preference
The system SHALL save the user's theme preference to `localStorage` and restore it on subsequent page loads.

#### Scenario: Theme preference persists on reload
- **WHEN** the user has selected light mode and reloads the page
- **THEN** the light theme SHALL be applied before the page becomes visible (no flash of dark content)

#### Scenario: Theme preference persists across navigation
- **WHEN** the user switches themes and navigates to a different page within the app
- **THEN** the selected theme SHALL remain active without resetting

### Requirement: Smooth theme transition
The system SHALL animate the color change when switching themes so the transition is not jarring.

#### Scenario: Theme switch animation
- **WHEN** the user activates the theme toggle
- **THEN** background and text colors SHALL transition smoothly over a short duration (≤ 300ms)

#### Scenario: No transition on initial page load
- **WHEN** the page loads and applies a saved theme preference
- **THEN** there SHALL be no animated transition — the theme SHALL appear instantly

### Requirement: All UI elements have sufficient contrast in both themes
Every text element, icon, border, and interactive surface SHALL be legible and visually distinguishable in both dark and light themes. No component SHALL use hardcoded white-opacity color classes on theme-variable backgrounds.

#### Scenario: Toggle icon visible in light mode
- **WHEN** light mode is active
- **THEN** the theme toggle icon SHALL be dark-tinted (not white) and clearly visible against the light navbar background

#### Scenario: Muted text legible in light mode
- **WHEN** light mode is active
- **THEN** secondary text (thread titles, labels, placeholders) SHALL be legible against the light background with at least 4:1 contrast

#### Scenario: Borders visible in light mode
- **WHEN** light mode is active
- **THEN** component borders and dividers SHALL render as visible dark-tinted lines, not invisible white-opacity lines

#### Scenario: Chatbox input and chips legible in light mode
- **WHEN** light mode is active and the user interacts with the chatbox
- **THEN** the input text, placeholder, and file attachment chips SHALL all be clearly visible against the chatbox background
