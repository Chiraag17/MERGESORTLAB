# Merge Sort Visualizer

A clean, modern web application to visualize the **Merge Sort** algorithm using the Divide & Conquer paradigm.

## Project Overview
This tool provides a step-by-step interactive experience to understand how Merge Sort works. It visualizes the array as vertical bars and simultaneously builds a recursion tree to show the "Divide" and "Conquer" phases.

## Features
- **Step-by-Step Animation**: Control the flow with Run, Pause, and Step buttons.
- **Recursion Tree**: Watch the array split into sub-problems and merge back together.
- **Real-time Statistics**: Track comparisons, array writes, and recursive calls.
- **Complexity Explanation**: View recurrence relations and Big O notation formatted with KaTeX.
- **Interactive Input**: Generate random arrays or type your own custom values.
- **Speed Control**: Adjust animation speed from 0.25x to 3x.

## How to Run
1. Download the project folder.
2. Ensure `index.html`, `styles.css`, and `script.js` are in the same directory.
3. Open `index.html` in any modern web browser.

## Algorithm Explanation
Merge Sort is a classic Divide and Conquer algorithm. It works by:
1. **Divide**: Splitting the unsorted list into $n$ sublists, each containing one element (a list of one element is considered sorted).
2. **Conquer**: Repeatedly merging sublists to produce new sorted sublists until there is only one sublist remaining.

### Complexity
- **Time Complexity**: $O(n \log n)$ in all cases (best, average, worst).
- **Space Complexity**: $O(n)$ due to the auxiliary space used during merging.
- **Stability**: Stable (preserves the relative order of equal elements).
