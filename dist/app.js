const TILES = [{
    ids: [1, 2, 3],
    edges: ['city', 'city', 'road', 'city'] // top, right, bottom, left
}, {
    ids: [4, 5, 6, 7, 8, 17, 18],
    edges: ['city', 'field', 'field', 'city']
}, {
    ids: [9, 10, 11, 12, 13, 85],
    edges: ['city', 'road', 'road', 'city']
}, {
    ids: [14, 15, 16],
    edges: ['field', 'city', 'field', 'city']
}, {
    ids: [19, 20, 21],
    edges: ['city', 'field', 'city', 'field']
}, {
    ids: [22, 23, 24, 25, 26],
    edges: ['city', 'field', 'field', 'field']
}, {
    ids: [27, 28, 29, 86],
    edges: ['city', 'field', 'road', 'road']
}, {
    ids: [30, 31, 32],
    edges: ['city', 'road', 'road', 'field']
}, {
    ids: [33, 34, 35],
    edges: ['city', 'road', 'road', 'road']
}, {
    ids: [36, 37, 38, 39],
    edges: ['city', 'road', 'field', 'road']
}, {
    ids: [40, 41, 42, 43, 44, 45, 46, 47],
    edges: ['road', 'field', 'road', 'field']
}, {
    ids: [48, 49, 50, 51, 52, 53, 54, 55, 56, 73],
    edges: ['field', 'field', 'road', 'road']
}, {
    ids: [57, 58, 59, 60, 84],
    edges: ['field', 'road', 'road', 'road']
}, {
    ids: [61, 77],
    edges: ['road', 'road', 'road', 'road']
}, {
    ids: [62, 63, 64, 65],
    edges: ['field', 'field', 'field', 'field']
}, {
    ids: [66, 67],
    edges: ['field', 'field', 'road', 'field']
}, {
    ids: [68, 80, 81, 82],
    edges: ['city', 'city', 'city', 'city']
}, {
    ids: [69, 70, 71, 72],
    edges: ['city', 'city', 'field', 'city']
}, {
    ids: [74],
    edges: ['city', 'field', 'road', 'field']
}, {
    ids: [75, 90],
    edges: ['road', 'city', 'road', 'city']
}, {
    ids: [76, 83],
    edges: ['field', 'road', 'field', 'road']
}, {
    ids: [78],
    edges: ['city', 'road', 'field', 'city']
}, {
    ids: [79],
    edges: ['field', 'city', 'field', 'field']
}, {
    ids: [87],
    edges: ['city', 'field', 'road', 'city']
}, {
    ids: [88, 89],
    edges: ['city', 'field', 'city', 'city']
}];

(() => {
    const ORIG = { x: 256, y: 256 };
    const SIZE = { x: 128, y: 128 };

    const deg2rad = (deg) => deg * Math.PI / 180;

    const c = document.getElementById('main-canvas');
    c.width = document.body.clientWidth;
    c.height = document.body.clientHeight;

    const HOR_TILES = Math.ceil(c.width / SIZE.x);
    const VER_TILES = Math.ceil(c.height / SIZE.y);

    const ctx = c.getContext('2d');

    const GRID_SIZE = { x: HOR_TILES, y: VER_TILES}
    const GRID = Array(GRID_SIZE.y).fill().map(() => Array(GRID_SIZE.x));
    const GRID_OFFSET = { x: 0, y: 0 };
    const OFFSET = { x: 0, y: 0}

    // ===== FUNCTIONS ============================================================================

    const equalEdges = (a, b) => a.every((e, i) => e === null || b[i] === null || e === b[i]);
    const noNeighbors = (a) => a.every(e => e === null);
    const permutateEdges = (edges) => Array(4).fill().map((e, i) => rotateEdges(edges, i * 90));
    const clear = () => ctx.clearRect(0, 0, c.width, c.height);

    const pickRandomTile = () => {
        const tile = TILES[~~(Math.random() * TILES.length)]
        return {
            tile,
            rotation: ~~(Math.random() * 4) * 90,
            index: ~~(Math.random() * tile.images.length)
        };
    };

    const drawImage = (img, x, y, rot = 0) => {
        const pivot = { x: x + SIZE.x / 2 + OFFSET.x, y: y + SIZE.y / 2 + OFFSET.y };
        const rads = deg2rad(rot);

        ctx.translate(pivot.x, pivot.y);
        ctx.rotate(rads);

        ctx.drawImage(img, 0, 0, ORIG.x, ORIG.y, -SIZE.x / 2, -SIZE.y / 2, SIZE.x, SIZE.y);

        ctx.rotate(-rads);
        ctx.translate(-pivot.x, -pivot.y);
    };

    const loadImages = () => {
        TILES.forEach(e => {
            e.images = [];

            e.ids.forEach(id => {
                const htmlId = 'tile-' + (id < 10 ? '0' : '') + id;
                e.images.push(document.getElementById(htmlId));
            });
        });
    };

    const rotateEdges = (edges, rot) => {
        const slots = Math.floor(rot / 90);
        const edgesCopy = [...edges];
        for (let i = 0; i < slots; i++) edgesCopy.unshift(edgesCopy.pop());
        return edgesCopy;
    };

    const getEdge = (y, x, edge) => {
        const edges = rotateEdges(GRID[y][x].tile.edges, GRID[y][x].rotation);
        return edges[edge];
    };

    const getNeighborEdges = (x, y) => {
        const out = [];

        out.push((!GRID[y - 1] || !GRID[y - 1][x]) ? null : getEdge(y - 1, x, 2)); // Top
        out.push((!GRID[y][x + 1]) ? null : getEdge(y, x + 1, 3)); // Right
        out.push((!GRID[y + 1] || !GRID[y + 1][x]) ? null : getEdge(y + 1, x, 0)); // Bottom
        out.push((!GRID[y][x - 1]) ? null : getEdge(y, x - 1, 1)); // Left

        return out;
    }

    const fillGrid = () => {
        for (let y = GRID_OFFSET.y - 1; y < GRID_SIZE.y + GRID_OFFSET.y + 1; y++) {
            for (let x = GRID_OFFSET.x - 1; x < GRID_SIZE.x + GRID_OFFSET.x + 1; x++) {
                if (!GRID[y]) GRID[y] = Array(GRID_SIZE.x);
                if (GRID[y][x]) continue;

                const edges = getNeighborEdges(x, y);
                if (noNeighbors(edges)) {
                    GRID[y][x] = pickRandomTile();
                    continue;
                }

                const eligible = [];
                TILES.forEach(tile => {
                    const perms = permutateEdges(tile.edges);
                    perms.forEach((e, i) => {
                        if (equalEdges(e, edges)) eligible.push({ tile, rotation: i * 90, index: ~~(Math.random() * tile.images.length) });
                    });
                });

                if (eligible.length > 0) GRID[y][x] = eligible[~~(Math.random() * eligible.length)];
                else GRID[y][x] = null;
            }
        }
    };

    const displayGrid = () => {
        for (let y = GRID_OFFSET.y - 1; y < GRID_SIZE.y + GRID_OFFSET.y + 1; y++) {
            for (let x = GRID_OFFSET.x - 1; x < GRID_SIZE.x + GRID_OFFSET.x + 1; x++) {
                if (!GRID[y] || !GRID[y][x]) {
                    console.log('skip for missing tile');
                    continue;
                }
                drawImage(GRID[y][x].tile.images[GRID[y][x].index], x * SIZE.x, y * SIZE.y, GRID[y][x].rotation);
            }
        }
    };

    // ===== EVENTS ===============================================================================

    let lock = true;
    let dragging = false;
    let startCoords = { x: 0, y: 0 };

    c.addEventListener('mousedown', e => {
        if (lock) return;
        startCoords = { x: e.pageX - OFFSET.x, y: e.pageY - OFFSET.y };
        dragging = true;
    });

    c.addEventListener('mouseup', () => {
        if (lock) return;
        dragging = false;
    });

    c.addEventListener('mousemove', e => {
        if (lock) return;
        if (!dragging) return;

        const delta = { x: e.pageX - startCoords.x, y: e.pageY - startCoords.y };
        OFFSET.x = delta.x;
        OFFSET.y = delta.y;

        const gridOffsetX = Math.ceil(OFFSET.x / SIZE.x) * -1;
        const gridOffsetY = Math.ceil(OFFSET.y / SIZE.y) * -1;

        if (GRID_OFFSET.x !== gridOffsetX || GRID_OFFSET.y !== gridOffsetY)
        {
            GRID_OFFSET.x = gridOffsetX;
            GRID_OFFSET.y = gridOffsetY;
            fillGrid();
        }

        clear();
        displayGrid();
    });

    // ===== LOADING ==============================================================================

    ctx.fillStyle = '#2572b3';
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.fillStyle = 'white';
    ctx.font = '48px Cambria, serif';
    const size = ctx.measureText('Loading...');
    ctx.fillText('Loading...', c.width / 2 - size.width / 2, c.height / 2);

    window.onload = () => {
        clear();
        loadImages();
        fillGrid();
        displayGrid();

        lock = false;
    };
})();
