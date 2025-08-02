const directions = [
    { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
    { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
    { dx: -1, dy: 1 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 }
];

class Cell {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.type = null
    }
}

class Grid {
    constructor(matrix) {
        this.matrix = {
            x: matrix[0],
            y: matrix[1]
        }

        this.cellContainer = []
        this.ready = false

        for (let y = 0; y < matrix[1]; y++) {
            for (let x = 0; x < matrix[0]; x++) {
                this.cellContainer.push(new Cell(x, y))
            }
        }
    }

    display() {
        for (let y = 0; y < this.matrix.y; y++) {
            for (let x = 0; x < this.matrix.x; x++) {
                let cell = this.getCell(x, y)
                switch (cell.type) {
                    case null:
                        this.setColor(x, y, 'white')
                        break
                    case 'block':
                        this.setColor(x, y, 'black')
                        break
                    case 'start':
                        this.setColor(x, y, 'green')
                        break
                    case 'end':
                        this.setColor(x, y, 'red')
                        break
                    case 'path':
                        this.setColor(x, y, 'yellow')
                        break

                }
            }
        }
    }
    setColor(x, y, color) {
        document.getElementById(`${x}x${y}`).style.backgroundColor = color
    }

    getCell(x, y) {
        return this.cellContainer.find(cell => cell.x == x && cell.y == y)
    }

    getCellByType(type) {
        return this.cellContainer.find(cell => cell.type == type)
    }


    setStartPoint(x, y) {
        this.getCell(x, y).type = 'start'
        this.setColor(x, y, 'green')
    }

    setEndPoint(x, y) {
        this.getCell(x, y).type = 'end'
        this.setColor(x, y, 'red')

    }

    setBlock(x, y) {
        this.getCell(x, y).type = 'block'
        this.setColor(x, y, 'black')

    }
    setNull(x, y) {
        this.getCell(x, y).type = null
        this.setColor(x, y, 'white')

    }



    fillGrid(blockAmount) {
        let coords = []
        for (let x = 0; x < this.matrix.x; x++) {
            for (let y = 0; y < this.matrix.y; y++) {
                if (this.getCell(x, y).type == null) {
                    coords.push({ x, y })
                }
            }
        }
        for (let i = coords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
                ;[coords[i], coords[j]] = [coords[j], coords[i]]
        }
        if (coords.length < blockAmount + 2) {
            throw new Error("Not enough empty space for start, end, and blocks")
        }
        const start = coords.pop()
        const end = coords.pop()
        this.setStartPoint(start.x, start.y)
        this.setEndPoint(end.x, end.y)
        
        for (let i = 0; i < blockAmount; i++) {
            const block = coords.pop()
            this.setBlock(block.x, block.y)
        }
        this.ready = true
    }

    isInBounds(x, y) {
        return x >= 0 && x < this.matrix.x && y >= 0 && y < this.matrix.y;
    }

    async generateMaze() {
        for (let x = 0; x < this.matrix.x; x++) {
            for (let y = 0; y < this.matrix.y; y++) {
                this.setBlock(x, y);
            }
        }

        let startX = Math.floor(Math.random() * this.matrix.x);
        let startY = Math.floor(Math.random() * this.matrix.y);

        const stack = [];
        stack.push([startX, startY]);
        this.setNull(startX, startY); 

        const directions = [
            [0, 2], 
            [0, -2],
            [2, 0],
            [-2, 0]
        ];

        while (stack.length > 0) {
            const [currentX, currentY] = stack[stack.length - 1];
            const unvisitedNeighbors = [];

            // Get all possible neighbors with two cells apart
            for (const [dx, dy] of directions) {
                const nx = currentX + dx;
                const ny = currentY + dy;

                if (this.isInBounds(nx, ny) && this.getCell(nx, ny).type === 'block') {
                    unvisitedNeighbors.push([nx, ny]);
                }
            }
            await wait()
            if (unvisitedNeighbors.length > 0) {
                // Randomly select an unvisited neighbor
                const [nextX, nextY] = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];

                // Carve a path between the current cell and the chosen neighbor
                this.setNull((currentX + nextX) / 2, (currentY + nextY) / 2); // Open the wall between
                this.setNull(nextX, nextY); // Open the neighboring cell

                // Push the neighbor to the stack to continue the path from there
                stack.push([nextX, nextY]);
            } else {
                // Backtrack if there are no unvisited neighbors
                stack.pop();
            }
        }

        // Set start and end points at random path cells
        this.fillGrid(0);
    }

    setGrid(blockAmount, maze) {
        if(maze){
            this.generateMaze()
            return
        }
        this.fillGrid(blockAmount)

    }

    setScores(node, scores) {
        if (!this.showScores) return
        let div = document.getElementById(`${node.x}x${node.y}`)

        for (let i = 0; i < 3; i++) {


            let textDiv

            if (div.childNodes.length < 3) {
                textDiv = document.createElement('a');
                textDiv.id = `score${i}`;
                textDiv.className = 'score';
                div.appendChild(textDiv);
                textDiv.textContent = scores[i]
            }
            textDiv = div.childNodes[i];

            textDiv.textContent = scores[i]

        }
    }

    start() {
        if (this.started) return
        if (!this.ready) return
        this.started = true
        this.a_star()
    }

    async reconstructPath(cameFrom, end) {
        let current = end;
        this.display()
        while (cameFrom.has(current) && cameFrom.get(current).type !== 'start') {
            current = cameFrom.get(current);
            current.type = 'path';

            this.setColor(current.x, current.y, 'yellow')
            await wait()
        }

    }

    async a_star() {
        let start = this.getCellByType('start')
        let end = this.getCellByType('end')


        let cellMatrix = {}

        for (let cell of this.cellContainer) {
            cellMatrix[`${cell.x},${cell.y}`] = cell
        }

        let linearFactor = 10 //düz istiqamətdə yolun dəyəri
        let diagonalFactor = 14 //diaqonal istiqamətdə yolun dəyəri

        let openSet = [start] //Açıq və yoxlanmamış xanalar(ilk yoxlanacaq xana başlanğıcdır)

        let cameFrom = new Map()
        let gScore = new Map() //Başlanğıcdan n ə qədər ən az dəyərli yol
        let fScore = new Map() //n dən sona qədər ən az dəyərli yol


        for (let cell of this.cellContainer) {
            fScore.set(cell, Infinity);
            gScore.set(cell, Infinity);
        }// bütün xanalar üçün defolt fScore və gScore dəyəri

        gScore.set(start, 0)
        fScore.set(start, h(start))


        //ui a skoru yaz
        let g = gScore.get(start)
        let f = fScore.get(start)
        let scores = [g, f - g, f]
        this.setScores(start, scores)


        while (openSet.length > 0) {
            await wait()
            if(clickWait){
                await waitForClick()
            }

            let current = openSet[0]; 

            for (let node of openSet) {
                if (fScore.get(node) < fScore.get(current)) {
                    current = node;
                }
                if(fScore.get(node) == fScore.get(current)){
                   if(gScore.get(node) > gScore.get(current)){
                       current = node
                   }
                }//2 - optimizasiya -- f skorlar bərabirdirsə g skoru böyük olanı seç
            }//1 - opensetdəki f skoru ən kiçik olan xananı seç

            if (current == end) {
                return this.reconstructPath(cameFrom, current) // alqoritmanın sonu
            }
            
            this.setColor(current.x, current.y, 'darkblue')


            openSet.splice(openSet.indexOf(current), 1) //yoxlanmamış xanalardan sil

            let neighbors = []

            for (const dir of directions) {
                let neighbor = cellMatrix[`${current.x + dir.dx},${current.y + dir.dy}`]

                if (neighbor && neighbor.type != 'block') {
                    neighbors.push(neighbor)
                }
            } //qonşuları tapır 

            for (let neighbor of neighbors) { 
                //ui stuff
                if (fScore.get(neighbor) == Infinity) this.setColor(neighbor.x, neighbor.y, 'lightblue')

                //hər bir qonşunun currentdən keçməklə başlanğıcdan olan dəyərini(tentative_gScore)
                //öncəki başlanğıcdan olan dəyərlə(gScore) müqayisə edir
                //əgər qonşu yoxlanmayıbsa, infinityə görə funksiyaya mütləq girir

                let tentative_gScore = gScore.get(current) + d(current, neighbor)

                if (tentative_gScore < gScore.get(neighbor)) {
                    //və həmin xananın dəyərlərini hesablayır
                    cameFrom.set(neighbor, current)
                    gScore.set(neighbor, tentative_gScore)
                    fScore.set(neighbor, tentative_gScore + h(neighbor))

                    //ui stuff
                    let g2 = gScore.get(neighbor)
                    let f2 = fScore.get(neighbor)
                    let scores2 = [g2, f2 - g2, f2]
                    this.setScores(neighbor, scores2)

                    if (!openSet.includes(neighbor)) { //açıq xana deyilsə yoxlanmaq üçün openSetə göndərir
                        openSet.push(neighbor)
                    }
                }

            }

        }
        return alert('yol yoxdu.')

        function d(current, neighbour) {
            if (Math.abs(current.x - neighbour.x) == 1 && Math.abs(current.y - neighbour.y) == 1) return diagonalFactor

            return linearFactor
        }

        function h(n) { //h cost hesablanması
            let cost = 0 

            let distance = {
                x: Math.abs(n.x - end.x),
                y: Math.abs(n.y - end.y)
            }

            let min = Math.min(distance.x, distance.y)
            let max = Math.max(distance.x, distance.y)

            cost = (max - min) * linearFactor + min * diagonalFactor

            return cost
        }


    }
}

let wait = () => new Promise(resolve => setTimeout(resolve, speed))

function waitForClick() {
    return new Promise(resolve => {
        document.addEventListener('click', () => resolve(), { once: true });
    });
}

function loadGrid(grid) {
    let matrix = grid.matrix

    let container = document.getElementById('gridContainer')

    container.style.aspectRatio = matrix.x / matrix.y
    container.style.width = `${matrix.x / matrix.y * 50 - 1}%`

    for (let y = 0; y < matrix.y; y++) {
        let row = document.createElement('div')
        row.className = 'row'

        container.append(row)

        for (let x = 0; x < matrix.x; x++) {
            let node = document.createElement('div')
            node.className = 'node'
            node.id = `${x}x${y}`
            row.append(node)
        }
    }
}

// Configuration

let startMatrix = [20, 10] //grid size (x, y)
let maze = false //create maze or random blocks
let clickWait = true //wait for click between each a_star algorithm iteration
let speed = 50 // wait time in ms between each iteration(higher value = slower)
let blockAmount = 0 //randomly generated blocks if maze is false(cant be higher than x*y-2)
let showScores = true //show g, f and h costs in the ui

let myGrid = new Grid(startMatrix)

loadGrid(myGrid)

onload = () => {
    myGrid.display()
    myGrid.showScores = showScores
    myGrid.setGrid(blockAmount, maze)
}

document.getElementById('gridContainer').onmouseup = (event) => {
    if (event.target.classList.contains('node')) {
        let raw = event.target.id.split('x')
        let x = parseInt(raw[0])
        let y = parseInt(raw[1])

        if (event.ctrlKey == true) {
            myGrid.setNull(x, y)
        }
        else if (event.shiftKey == true) {
            myGrid.setStartPoint(x, y)
        }
        else if (event.altKey == true) {
            myGrid.setEndPoint(x, y)
        }
        else if (event.button == 1) {
            myGrid.setBlock(x, y)
        }
        else if (event.button == 0) {
            myGrid.start()
        }
    }
};







