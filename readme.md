# A* Pathfinding Visualization Project

## Overview
This project is a visualization tool for A* pathfinding algorithm. It demonstrates how this algorithm finds the shortest path between two points in a grid-based environment.

## Features
- Interactive grid creation
- Start and end point selection
- Visualization of A* pathfinding algorithm

## How to Run
1. Clone the repository.
2. Open `index.html` in your browser.
3. Interact with the grid to visualize pathfinding.

## Configuration
- **startMatrix** Grid Size (number, number)
- **maze** Create maze or random blocks (boolean)
- **clickWait** wait for click between each a_star algorithm iteration (boolean)
- **speed** Wait time in ms between each iteration, higher value = slower (number)
- **blockAmount** Randomly generated block amount if maze is false (number)
- **showScores** Show g, f and h costs in the ui (boolean)

- *Change these settings in the **main.js** file(scroll to bottom).*
- *After change, save and refresh the page.*

## Keybinds
- **Left Click** start the algorithm
- **Middle Click** *block* to the cursor pointed node
- **CTRL + Left Click** *clear* the cursor pointed node
- **SHIFT + Left Click** set *start* point to the cursor pointed node
- **ALT + Left Click** set *end* point to the cursor pointed node

## Disclaimer
- *There could be tons of ui bugs, I know. But if you find any misbehave, specific cases or optimizes in the algorithm, I am open for Issues*.

## License
This project is licensed under the MIT License.
