


const graph = {}; // Dynamic graph created by user
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
const queueList = document.getElementById('queueList');
const addEdgeForm = document.getElementById('addEdgeForm');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');

let steps = [];
let stepIndex = 0;
let interval = null;

const positions = {}; // Node positions for drawing

// Helper: Add edge to the graph
function addEdge(from, to, cost) {
    if (!graph[from]) graph[from] = [];
    if (!positions[from]) positions[from] = randomPosition();
    if (!positions[to]) positions[to] = randomPosition();

    graph[from].push({ node: to, cost });
    drawGraph();
}

// Helper: Generate random positions for nodes
function randomPosition() {
    return { x: Math.random() * 700 + 50, y: Math.random() * 500 + 50 };
}

// Helper: Draw the graph
function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const from in graph) {
        for (const edge of graph[from]) {
            const to = edge.node;
            const start = positions[from];
            const end = positions[to];

            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.strokeStyle = '#ccc';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();

            // Draw cost
            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;
            ctx.fillStyle = 'black';
            ctx.fillText(edge.cost, midX, midY);
        }
    }

    for (const node in positions) {
        const { x, y } = positions[node];
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = 'black';
        ctx.fillText(node, x - 5, y + 5);
    }
}
function uniformCostSearch(start, goal) {
    const visited = new Map();
    const queue = [{ node: start, cost: 0, path: [start] }];
    const steps = [];

    while (queue.length > 0) {
        queue.sort((a, b) => a.cost - b.cost); // Sort queue by cost

        const current = queue.shift();
        steps.push(current);

        console.log('Visiting node:', current.node, 'Current cost:', current.cost);

        // Update the queue UI
        updateQueueUI(queue);

        if (current.node === goal) {
            updateQueueUI([]); // Clear the queue when goal is found
            console.log('Goal node found.');
            return steps;
        }

        // Skip if the current node has already been visited with a lower or equal cost
        if (visited.has(current.node) && visited.get(current.node) <= current.cost) {
            continue;
        }

        visited.set(current.node, current.cost);

        for (const neighbor of graph[current.node] || []) {
            const newCost = current.cost + neighbor.cost;

            // Only add the neighbor if it hasn't been visited or the new path is cheaper
            if (!visited.has(neighbor.node) || newCost < visited.get(neighbor.node)) {
                queue.push({
                    node: neighbor.node,
                    cost: newCost,
                    path: [...current.path, neighbor.node],
                });
            }
        }
    }

    console.log('Goal node not reachable.');
    return steps;
}



// Breadth-First Search
function breadthFirstSearch(start, goal) {
    const visited = new Set();
    const queue = [{ node: start, path: [start] }];
    const steps = [];

    while (queue.length > 0) {
        const current = queue.shift();
        steps.push(current);

        console.log('Visiting node:', current.node, 'Path:', current.path);

        if (current.node === goal) {
            updateQueueUI([]); // Clear the queue when goal is found
            console.log('Goal node found.');
            return steps;
        }

        if (visited.has(current.node)) continue;

        visited.add(current.node);

        for (const neighbor of graph[current.node] || []) {
            if (!visited.has(neighbor.node)) { // Only add unvisited neighbors
                queue.push({
                    node: neighbor.node,
                    path: [...current.path, neighbor.node],
                });
            }
        }

        updateQueueUI(queue); // Update the UI with the current queue
    }

    console.log('Goal node not reachable.');
    return steps;
}

// Depth-First Search
function depthFirstSearch(start, goal) {
    const visited = new Set();
    const stack = [{ node: start, path: [start] }];
    const steps = [];

    while (stack.length > 0) {
        const current = stack.pop();
        steps.push(current);

        console.log('Visiting node:', current.node, 'Path:', current.path);

        if (current.node === goal) {
            updateQueueUI([]); // Clear the queue when goal is found
            console.log('Goal node found.');
            return steps;
        }

        if (visited.has(current.node)) continue;

        visited.add(current.node);

        for (const neighbor of graph[current.node] || []) {
            if (!visited.has(neighbor.node)) { // Only add unvisited neighbors
                stack.push({
                    node: neighbor.node,
                    path: [...current.path, neighbor.node],
                });
            }
        }

        updateQueueUI(stack); // Update the UI with the current stack
    }

    console.log('Goal node not reachable.');
    return steps;
}


// Update priority queue in UI
function updateQueueUI(queue) {
    queueList.innerHTML = ''; // Clear existing queue

    // Sort the queue by cost for proper display in UCS
    const sortedQueue = [...queue].sort((a, b) => a.cost - b.cost);

    // Loop through each item in the sorted queue and display it
    sortedQueue.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.node}: Cost = ${item.cost}`;
        queueList.appendChild(li);
    });
}

function visualizeStep() {
    if (stepIndex < steps.length) {
        const step = steps[stepIndex];
        const currentNode = positions[step.node];
        
        // Highlight the current node
        ctx.beginPath();
        ctx.arc(currentNode.x, currentNode.y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = 'yellow'; // Highlight the current node
        ctx.fill();
        ctx.closePath();

        // Draw the path
        const path = step.path;
        for (let i = 0; i < path.length - 1; i++) {
            const fromNode = path[i];
            const toNode = path[i + 1];
            const start = positions[fromNode];
            const end = positions[toNode];

            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.strokeStyle = 'green'; // Highlight the path in green
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.closePath();
        }

        // Update the queue UI (optional)
        updateQueueUI(steps.slice(0, stepIndex + 1));

        stepIndex++;
    } else {
        clearInterval(interval); // Stop the interval when all steps are done
    }
}


// Reset the graph and UI
function reset() {
    steps = [];
    stepIndex = 0;
    Object.keys(graph).forEach(key => delete graph[key]);
    Object.keys(positions).forEach(key => delete positions[key]);
    queueList.innerHTML = '';
    drawGraph();
}

// Add edge form submission
addEdgeForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const from = document.getElementById('fromNode').value.toUpperCase();
    const to = document.getElementById('toNode').value.toUpperCase();
    const cost = parseInt(document.getElementById('cost').value, 10);

    addEdge(from, to, cost);
    addEdgeForm.reset();
});
// UCS Button
document.getElementById('startUCSButton').addEventListener('click', () => {
const startNode = prompt('Enter start node:').toUpperCase();
const goalNode = prompt('Enter goal node:').toUpperCase();
steps = uniformCostSearch(startNode, goalNode);
stepIndex = 0;
interval = setInterval(visualizeStep, 1000);
});

// BFS Button
document.getElementById('startBFSButton').addEventListener('click', () => {
const startNode = prompt('Enter start node:').toUpperCase();
const goalNode = prompt('Enter goal node:').toUpperCase();
steps = breadthFirstSearch(startNode, goalNode);
stepIndex = 0;
interval = setInterval(visualizeStep, 1000);
});

// DFS Button
document.getElementById('startDFSButton').addEventListener('click', () => {
const startNode = prompt('Enter start node:').toUpperCase();
const goalNode = prompt('Enter goal node:').toUpperCase();
steps = depthFirstSearch(startNode, goalNode);
stepIndex = 0;
interval = setInterval(visualizeStep, 1000);
});

// Reset Button
document.getElementById('resetButton').addEventListener('click', reset);

// Start Search
startButton.addEventListener('click', () => {
    const algorithm = prompt('Enter search algorithm (UCS, BFS, DFS):').toUpperCase();
    const startNode = prompt('Enter start node:').toUpperCase();
    const goalNode = prompt('Enter goal node:').toUpperCase();

    switch (algorithm) {
        case 'UCS':
            steps = uniformCostSearch(startNode, goalNode);
            break;
        case 'BFS':
            steps = breadthFirstSearch(startNode, goalNode);
            break;
        case 'DFS':
            steps = depthFirstSearch(startNode, goalNode);
            break;
        default:
            alert('Invalid algorithm. Please enter UCS, BFS, or DFS.');
            return;
    }

    stepIndex = 0;
    interval = setInterval(visualizeStep, 1000);
});

// Reset graph
resetButton.addEventListener('click', reset);

// Initialize
drawGraph();




