FollowUp
========

Simple webpage that visualizes data about the people you follow on instagram. Built using D3.js and C3.js.

Design Principles:

- Feedback: While the data is loaded, a progress bar is shown below the navigation bar. All interactive and data-driven elements become visible once the data is available.
- Similarity and color vision: On the map, image locations are represented as colored circles. Circles belonging to the same user have the same color, making it easy to see patterns at first glance. When the mouse hovers over one element, all circles that do not belong to this user become grey. This helps the eye to quickly detect the relevant (colored) information vs the grey background.
