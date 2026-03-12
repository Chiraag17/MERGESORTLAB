/**
 * Merge Sort Visualizer - Step Engine & UI Controller
 */

// --- STATE MANAGEMENT ---
let originalArray = [4, 91, 1, 45, 67, 32, 38];
let currentArray = [...originalArray];
let steps = [];
let currentStepIdx = -1;
let animationTimeout = null;
let isPlaying = false;
let speed = 1.0;

// Statistics
let stats = {
    comparisons: 0,
    writes: 0,
    calls: 0
};

// --- DOM ELEMENTS ---
const vizContainer = document.getElementById('viz-container');
const treeContainer = document.getElementById('tree-container');
const arrayInput = document.getElementById('array-input');
const currentStepEl = document.getElementById('current-step');
const totalStepsEl = document.getElementById('total-steps');
const explainPhaseEl = document.getElementById('explain-phase');
const explainMsgEl = document.getElementById('explain-msg');
const speedSlider = document.getElementById('speed-slider');
const speedValEl = document.getElementById('speed-val');

// Stats Elements
const statCompEl = document.getElementById('stat-comparisons');
const statWriteEl = document.getElementById('stat-writes');
const statCallEl = document.getElementById('stat-calls');

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
    initMath();
    initTabs();
    generateSteps();
    renderVisualization();
    updateUI();

    // Event Listeners
    document.getElementById('btn-random').addEventListener('click', generateRandomArray);
    document.getElementById('btn-run').addEventListener('click', playAnimation);
    document.getElementById('btn-pause').addEventListener('click', pauseAnimation);
    document.getElementById('btn-step').addEventListener('click', stepForward);
    document.getElementById('btn-reset').addEventListener('click', resetAnimation);
    speedSlider.addEventListener('input', handleSpeedChange);
    arrayInput.addEventListener('change', handleArrayInput);
});

function initMath() {
    if (window.katex) {
        katex.render("T(n) = 2T(n/2) + O(n)", document.getElementById('math-recurrence'));
        katex.render("O(n \\log n)", document.getElementById('math-time'));
        katex.render("O(n)", document.getElementById('math-space'));
    }
}

function initTabs() {
    document.querySelectorAll('.tab-link').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-link').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.center-panel .tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
            if (btn.dataset.tab === 'recursion-tree') renderRecursionTree();
        });
    });

    document.querySelectorAll('.tab-link-right').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-link-right').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.right-panel .tab-content-right').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });
}

// --- ALGORITHM & STEP GENERATION ---
function generateSteps() {
    steps = [];
    stats = { comparisons: 0, writes: 0, calls: 0 };
    
    // Initial State
    steps.push({
        id: 0,
        phase: "READY",
        message: "Array initialized. Ready to sort.",
        array: [...originalArray],
        highlights: [],
        codeLine: 1,
        stats: { ...stats },
        treeNodes: [],
        rows: [
            { type: 'parent', groups: [[...originalArray]] }
        ]
    });

    const arrForSorting = originalArray.map((val, idx) => ({ val, originalIdx: idx }));
    const treeNodes = [];
    
    function mergeSort(arr, depth = 0, xOffset = 0, width = 100, parentId = null) {
        stats.calls++;
        const nodeId = `node-${depth}-${xOffset.toFixed(2)}`;
        const node = {
            id: nodeId,
            parentId: parentId,
            depth,
            x: xOffset,
            width,
            values: arr.map(item => item.val),
            visible: false
        };
        treeNodes.push(node);

        if (arr.length <= 1) {
            steps.push({
                phase: "CONQUER",
                message: `Base case reached: [${arr[0].val}]`,
                array: getCurrentArrayState(),
                highlights: [arr[0].originalIdx],
                codeLine: 2,
                stats: { ...stats },
                rows: [
                    { type: 'parent', groups: [arr.map(x => x.val)] }
                ]
            });
            return arr;
        }

        const mid = Math.floor(arr.length / 2);
        const leftPart = arr.slice(0, mid);
        const rightPart = arr.slice(mid);

        steps.push({
            phase: "DIVIDE",
            message: `Splitting array into two halves`,
            array: getCurrentArrayState(),
            highlights: arr.map(i => i.originalIdx),
            codeLine: 4,
            stats: { ...stats },
            nodeToShow: nodeId,
            rows: [
                { type: 'parent', groups: [arr.map(x => x.val)] },
                { type: 'children', groups: [leftPart.map(x => x.val), rightPart.map(x => x.val)] }
            ]
        });

        const left = mergeSort(leftPart, depth + 1, xOffset - width/4, width/2, nodeId);
        const right = mergeSort(rightPart, depth + 1, xOffset + width/4, width/2, nodeId);

        return merge(left, right, depth, nodeId);
    }

    function merge(left, right, depth, nodeId) {
        let result = [];
        let i = 0, j = 0;

        steps.push({
            phase: "COMBINE",
            message: `Merging two sorted halves`,
            array: getCurrentArrayState(),
            highlights: [],
            codeLine: 7,
            stats: { ...stats },
            rows: [
                { type: 'children', groups: [left.map(x => x.val), right.map(x => x.val)] },
                { type: 'merged', groups: [[]] }
            ]
        });

        while (i < left.length && j < right.length) {
            stats.comparisons++;
            steps.push({
                phase: "COMPARE",
                message: `Comparing ${left[i].val} and ${right[j].val}`,
                array: getCurrentArrayState(),
                highlights: [],
                codeLine: 7,
                stats: { ...stats },
                rows: [
                    { 
                        type: 'children', 
                        groups: [left.map(x => x.val), right.map(x => x.val)],
                        highlights: [`0-${i}`, `1-${j}`]
                    },
                    { type: 'merged', groups: [result.map(x => x.val)] }
                ]
            });

            if (left[i].val <= right[j].val) {
                result.push(left[i]);
                i++;
            } else {
                result.push(right[j]);
                j++;
            }
        }

        while (i < left.length) {
            result.push(left[i]);
            i++;
        }
        while (j < right.length) {
            result.push(right[j]);
            j++;
        }
        
        // Update global array state
        const rangeIndices = [...left.map(x => x.originalIdx), ...right.map(x => x.originalIdx)].sort((a,b) => a-b);
        const newArrayState = getCurrentArrayState();
        result.forEach((item, idx) => {
            stats.writes++;
            newArrayState[rangeIndices[idx]] = item.val;
        });

        steps.push({
            phase: "COMBINE",
            message: `Merge complete`,
            array: [...newArrayState],
            highlights: [],
            codeLine: 7,
            stats: { ...stats },
            rows: [
                { type: 'children', groups: [left.map(x => x.val), right.map(x => x.val)] },
                { type: 'merged', groups: [result.map(x => x.val)] }
            ]
        });

        return result;
    }

    function getCurrentArrayState() {
        return steps.length > 0 ? [...steps[steps.length - 1].array] : [...originalArray];
    }

    mergeSort(arrForSorting);

    // Final Step
    steps.push({
        phase: "COMPLETE",
        message: "Array is fully sorted!",
        array: [...steps[steps.length - 1].array],
        highlights: originalArray.map((_, i) => i),
        codeLine: 1,
        stats: { ...stats },
        rows: [
            { type: 'parent', groups: [steps[steps.length - 1].array] }
        ]
    });

    // Attach tree info to steps
    let visibleNodes = [];
    steps.forEach(step => {
        if (step.nodeToShow) visibleNodes.push(step.nodeToShow);
        step.treeNodes = treeNodes.map(n => ({ ...n, visible: visibleNodes.includes(n.id) }));
    });

    totalStepsEl.textContent = steps.length - 1;
}

// --- UI RENDERING ---
function renderVisualization() {
    vizContainer.innerHTML = '';
    const step = steps[currentStepIdx === -1 ? 0 : currentStepIdx];
    
    // Create rows container
    const rows = step.rows || [ { type: 'main', groups: [step.array] } ];

    rows.forEach(rowData => {
        const rowEl = document.createElement('div');
        rowEl.className = 'viz-row';
        
        rowData.groups.forEach((group, gIdx) => {
            const groupEl = document.createElement('div');
            groupEl.className = 'viz-group';

            group.forEach((val, vIdx) => {
                const box = document.createElement('div');
                box.className = 'array-box';
                box.textContent = val;

                // Determine absolute index for highlighting
                if (rowData.highlights && rowData.highlights.includes(`${gIdx}-${vIdx}`)) {
                    if (step.phase === 'COMPARE') box.classList.add('comparing');
                    else if (step.phase === 'COMBINE') box.classList.add('merging');
                }
                
                if (step.phase === 'COMPLETE') {
                    box.classList.add('sorted');
                }

                groupEl.appendChild(box);
            });
            rowEl.appendChild(groupEl);
        });
        vizContainer.appendChild(rowEl);
    });
}

function renderRecursionTree() {
    treeContainer.innerHTML = '';
    const step = steps[currentStepIdx === -1 ? 0 : currentStepIdx];
    const nodes = step.treeNodes || [];

    const containerWidth = treeContainer.offsetWidth;
    const levelHeight = 80;

    nodes.forEach(node => {
        if (!node.visible) return;

        const el = document.createElement('div');
        el.className = 'recursion-node';
        el.textContent = `[${node.values.join(',')}]`;
        
        // Position
        const left = (containerWidth / 2) + (node.x * (containerWidth / 150));
        const top = node.depth * levelHeight + 20;
        
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
        el.style.transform = 'translate(-50%, 0)';
        
        treeContainer.appendChild(el);

        // Draw edge to parent
        if (node.parentId) {
            const parent = nodes.find(n => n.id === node.parentId);
            if (parent && parent.visible) {
                const pLeft = (containerWidth / 2) + (parent.x * (containerWidth / 150));
                const pTop = parent.depth * levelHeight + 45; // Below parent node
                
                const dx = left - pLeft;
                const dy = top - pTop;
                const angle = Math.atan2(dy, dx);
                const length = Math.sqrt(dx * dx + dy * dy);

                const edge = document.createElement('div');
                edge.className = 'tree-edge';
                edge.style.width = `${length}px`;
                edge.style.left = `${pLeft}px`;
                edge.style.top = `${pTop}px`;
                edge.style.transform = `rotate(${angle}rad)`;
                treeContainer.appendChild(edge);
            }
        }
    });
}

function updateUI() {
    const step = steps[currentStepIdx === -1 ? 0 : currentStepIdx];
    
    currentStepEl.textContent = Math.max(0, currentStepIdx);
    explainPhaseEl.textContent = step.phase;
    explainMsgEl.textContent = step.message;

    // Stats
    statCompEl.textContent = step.stats.comparisons;
    statWriteEl.textContent = step.stats.writes;
    statCallEl.textContent = step.stats.calls;

    // Code Highlighting
    document.querySelectorAll('#pseudocode span').forEach(el => el.classList.remove('highlight'));
    const lineEl = document.getElementById(`line-${step.codeLine}`);
    if (lineEl) lineEl.classList.add('highlight');

    renderVisualization();
    if (document.getElementById('recursion-tree').classList.contains('active')) {
        renderRecursionTree();
    }
}

// --- CONTROLS ---
function playAnimation() {
    if (isPlaying) return;
    if (currentStepIdx >= steps.length - 1) resetAnimation();
    
    isPlaying = true;
    document.getElementById('btn-run').disabled = true;
    document.getElementById('btn-pause').disabled = false;
    
    animate();
}

function animate() {
    if (!isPlaying) return;
    
    if (currentStepIdx < steps.length - 1) {
        stepForward();
        animationTimeout = setTimeout(animate, 1000 / speed);
    } else {
        pauseAnimation();
    }
}

function pauseAnimation() {
    isPlaying = false;
    clearTimeout(animationTimeout);
    document.getElementById('btn-run').disabled = false;
    document.getElementById('btn-pause').disabled = true;
}

function stepForward() {
    if (currentStepIdx < steps.length - 1) {
        currentStepIdx++;
        updateUI();
    }
}

function resetAnimation() {
    pauseAnimation();
    currentStepIdx = 0;
    updateUI();
}

function generateRandomArray() {
    const arr = [];
    for (let i = 0; i < 10; i++) {
        arr.push(Math.floor(Math.random() * 151) - 50); // -50 to 100
    }
    originalArray = arr;
    arrayInput.value = originalArray.join(', ');
    resetToNewArray();
}

function handleArrayInput() {
    const val = arrayInput.value;
    const parts = val.split(/[,\s]+/).filter(x => x.trim() !== '');
    const newArr = parts.map(Number);

    if (newArr.some(isNaN) || newArr.length === 0) {
        alert("Please enter valid integers separated by commas.");
        return;
    }

    originalArray = newArr;
    resetToNewArray();
}

function resetToNewArray() {
    pauseAnimation();
    generateSteps();
    currentStepIdx = 0;
    updateUI();
}

function handleSpeedChange() {
    speed = parseFloat(speedSlider.value);
    speedValEl.textContent = speed.toFixed(1);
}
