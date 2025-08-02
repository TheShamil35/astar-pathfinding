let matrix = [200, 100]

const directions = [
    { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
    { dx: -1, dy: 0 },                { dx: 1, dy: 0 },
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
        this.matrix = {}
        this.matrix.x = matrix[0]
        this.matrix.y = matrix[1]


        this.cellContainer = []
        for (let y = 0; y < matrix[1]; y++) {
            for (let x = 0; x < matrix[0]; x++) {
                this.cellContainer.push(new Cell(x, y))
            }
        }
    }

    display() {
        let result = []

        for (let y = 0; y < this.matrix.y; y++) {
            for (let x = 0; x < this.matrix.x; x++) {
                let cell = this.getCell(x, y)
                switch (cell.type) {
                    case null:
                        result.push('- ')
                        break
                    case 'block':
                        result.push('| ')
                        break
                    case 'start':
                        result.push('O ')
                        break
                    case 'end':
                        result.push('* ')
                        break
                    case 'path':
                        result.push('z ')
                        break

                }
            }
            result.push(`\n`)
        }
        console.log(result.join(''))
    }

    getCell(x, y) {
        return this.cellContainer.find(cell => cell.x == x && cell.y == y)
    }

    getCellByType(type) {
        return this.cellContainer.find(cell => cell.type == type)
    }


    setStartPoint(x, y) {
        this.getCell(x, y).type = 'start'
    }

    setEndPoint(x, y) {
        this.getCell(x, y).type = 'end'

    }

    setBlock(x, y) {
        this.getCell(x, y).type = 'block'
    }


    randomStartAndEndPoints(amount) {
        while (true) {
            let x = Math.floor(Math.random() * this.matrix.x)
            let y = Math.floor(Math.random() * this.matrix.y)

            if (this.getCell(x, y).type != null) continue

            this.setStartPoint(x, y)
            break
        }
        while (true) {
            let x = Math.floor(Math.random() * this.matrix.x)
            let y = Math.floor(Math.random() * this.matrix.y)
            if (this.getCell(x, y).type != null) continue

            this.setEndPoint(x, y)
            break
        }
        let i = amount
        while (i > 0) {
            let x = Math.floor(Math.random() * this.matrix.x)
            let y = Math.floor(Math.random() * this.matrix.y)

            if (this.getCell(x, y).type != null) continue

            this.setBlock(x, y)

            i--
        }
    }

    
    

    setGrid(blockAmount) {
        this.randomStartAndEndPoints(blockAmount)
        
    }
    start(){
        this.a_star()
    }

    reconstructPath(cameFrom, end) {
        let current = end;
        while (cameFrom.has(current) && cameFrom.get(current).type !== 'start') {
            current = cameFrom.get(current);
            current.type = 'path';
        }
        
    }

    a_star() {
        let start = this.getCellByType('start')
        let end = this.getCellByType('end')


        let cellMatrix = {}
        for (let cell of this.cellContainer){
            cellMatrix[`${cell.x},${cell.y}`] = cell
        }

        let linearFactor = 10 //düz istiqamətdə yolun dəyəri
        let diagonalFactor = 14 //diaqonal istiqamətdə yolun dəyəri

        let openSet = [start] //Açıq və yoxlanmamış xanalar // defolt olaraq başlanğıc xana


        let cameFrom = new Map() //hər bir xananın gəldiyi xana
        let gScore = new Map() //Başlanğıcdan n ə qədər ən az dəyərli yol
        let fScore = new Map() //n dən sona qədər heuristik yol dəyəri


        for (let cell of this.cellContainer) {
            fScore.set(cell, Infinity);
            gScore.set(cell, Infinity);
        } //defolt fScore və gScore dəyəri

        gScore.set(start, 0)
        fScore.set(start, h(start))


        while (openSet.length > 0) { //openSetin içində xana olduğu müddətcə
            let current = openSet[0]; // Ilk nodu seç

            for (let node of openSet) {
                if (fScore.get(node) < fScore.get(current)) {
                    current = node;
                } //openSetin içindəki elementləri yoxlayaraq ən az olanı tap
                if(fScore.get(node) == fScore.get(current)){
                    if(gScore.get(node) > gScore.get(current)){
                        current = node
                    }
                }//optimizasiya / bərabərdirsə gCostu çox olanı (sona daha yaxın olanı) seç
                
            }

            if (current == end) { //sona çatdıqda alqoritmadan çıxır
                return this.reconstructPath(cameFrom, current) 
            }


            openSet.splice(openSet.indexOf(current), 1) //yoxlanmamış xanalardan sil

            // let neighbors = cellMatrix.filter(node => Math.abs(node.x - current.x) <= 1 && Math.abs(node.y - current.y) <= 1 && !(node.x === current.x && node.y === current.y) && node.type != 'block') //qonşuları tapır || optimizasiya lazım
            // let neighbors = directions
            // .map(dir => {
            //   return cellMatrix.find(node=>node.x == current.x + dir.dx && node.y == current.y + dir.dy && node.type != 'block');
            // })  
            // .filter(Boolean);  //qonşuları tapır 

            let neighbors = []
            for (const dir of directions){
                let neighbor = cellMatrix[`${current.x +dir.dx},${current.y + dir.dy}`]

                if(neighbor && neighbor.type != 'block'){
                    neighbors.push(neighbor)
                }
            }  //qonşuları tapır 

            for (let neighbor of neighbors) { //hər bir qonşunun hazırki xanadan keçməklə başlanğıcdan olan dəyərini öncəki dəyərlə müqayisə edir
                let tentative_gScore = gScore.get(current) + d(current, neighbor) //yoxlanan qonşunun gScore unu tapır(hazırkinin üstünə qonşu diaqonaldısa 14 deyilsə 10 gələrək)

                if (tentative_gScore < gScore.get(neighbor)) {//əgər qonşunun bilinən başlanğıcdan məsafəsi hazırki xanadan keçməklə başlanğıcdan məsafəsindən böyükdürsə(daha yaxın yol tapılıb)

                    cameFrom.set(neighbor, current) //qonşuya gəlinən xana = indiki xana
                    gScore.set(neighbor, tentative_gScore) //qonşunun gscore unu təyin edir
                    fScore.set(neighbor, tentative_gScore + h(neighbor)) //həmin gscore un üstünə sona qədər olan heuristik skoru təyin edir

                    if (!openSet.includes(neighbor)) { //açıq deyilsə yenidən yoxlanmaq üçün openSetə göndərir
                        openSet.push(neighbor)
                    }
                }

            }

        }
        return console.log('yol yoxdu.')

        function d(current, neighbour) {
            if (Math.abs(current.x - neighbour.x) == 1 && Math.abs(current.y - neighbour.y) == 1) return diagonalFactor
            return linearFactor
        }

        function h(n) {
            let cost = 0 // cəmi dəyər

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


module.exports = Grid

let myGrid = new Grid(matrix)

myGrid.display()
myGrid.setGrid(10000)
myGrid.display()
myGrid.start()
myGrid.display()



