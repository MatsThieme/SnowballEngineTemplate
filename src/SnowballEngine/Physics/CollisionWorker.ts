const tsworker = `self.addEventListener('message', (e: MessageEvent) => {
    if (!e.data) return postMessage(0);

    if (e.data === 'close') return close();

    if (e.data.name === 'p') {
        return postMessage(CollisionWorker.PolygonCollision(e.data.data));
    } else if (e.data.name === 'c') {
        return postMessage(CollisionWorker.CircleCollision(e.data.data));
    } else if (e.data.name === 'pc') {
        return postMessage(CollisionWorker.PolygonCircleCollision(e.data.data));
    } else if (e.data.name === 'ct') {
        return postMessage(CollisionWorker.CircleTilemapCollision_(e.data.data));
    } else if (e.data.name === 'pt') {
        return postMessage(CollisionWorker.PolygonTilemapCollision(e.data.data));
    }
});

/**
 * 
 * @internal
 * 
 */
declare function postMessage(msg: any): void;

/**
 *
 * @internal
 *
 */
namespace CollisionWorker {
    export function CircleCollision(data: { A: { position: { x: number, y: number }, radius: number }, B: { position: { x: number, y: number }, radius: number } }): { contacts: { x: number, y: number }[], penetrationDepth: number, normal: { x: number, y: number } } | undefined {
        const { A, B } = data;

        const AB = { x: B.position.x - A.position.x, y: B.position.y - A.position.y };
        const ABMag = Math.sqrt(AB.x ** 2 + AB.y ** 2);
        if (ABMag > A.radius + B.radius) return;
        const penetrationDepth = ABMag != 0 ? A.radius + B.radius - ABMag : Math.max(A.radius, B.radius);
        const normal = ABMag != 0 ? { x: AB.x / ABMag, y: AB.y / ABMag } : { x: 1, y: 0 };

        const contacts = [{ x: normal.x * (A.radius - penetrationDepth / 2 * (A.radius / B.radius)) + A.position.x, y: normal.y * (A.radius - penetrationDepth / 2 * (A.radius / B.radius)) + A.position.y }];

        return { contacts, penetrationDepth, normal };
    }

    export function PolygonCollision(data: { A: { x: number, y: number }[], B: { x: number, y: number }[] }): { contacts: { x: number, y: number }[], penetrationDepth: number, normal: { x: number, y: number } } | undefined {
        const { A, B } = data;
        const AFaces = A.map((v, i) => new Face(A[i % A.length], A[(i + 1) % A.length]));
        const BFaces = B.map((v, i) => new Face(B[i % B.length], B[(i + 1) % B.length]));

        const APos = vecAvg(...A);
        const BPos = vecAvg(...B);

        let leastPenetration: number = Infinity;
        let referenceIndex!: number;
        let referenceCollider!: string;
        let normal = { x: 0, y: 0 };

        for (let i = 0; i < AFaces.length; i++) {
            const aP = project(AFaces[i].normal, A);
            const bP = project(AFaces[i].normal, B);

            const overlap = Math.min(aP.max, bP.max) - Math.max(aP.min, bP.min);

            if (overlap < 0) {
                return;
            } else {
                if (overlap <= leastPenetration) {
                    leastPenetration = overlap;
                    referenceIndex = i;
                    referenceCollider = 'A';
                    normal = AFaces[i].normal;
                }
            }
        }

        for (let i = 0; i < BFaces.length; i++) {
            const aP = project(BFaces[i].normal, A);
            const bP = project(BFaces[i].normal, B);

            const overlap = Math.min(aP.max, bP.max) - Math.max(aP.min, bP.min);

            if (overlap < 0) {
                return;
            } else {
                if (overlap < leastPenetration) {
                    leastPenetration = overlap;
                    referenceIndex = i;
                    referenceCollider = 'B';
                    normal = BFaces[i].normal;
                }
            }
        }

        let leastPenetrationNormal = referenceCollider === 'A' ? AFaces[referenceIndex].normal : BFaces[referenceIndex].normal;


        const APosN = { x: APos.x + leastPenetrationNormal.x, y: APos.y + leastPenetrationNormal.y };
        const APosNF = { x: APos.x - leastPenetrationNormal.x, y: APos.y - leastPenetrationNormal.y };

        if (distance(BPos, APosN) > distance(BPos, APosNF)) leastPenetrationNormal = { x: -leastPenetrationNormal.x, y: -leastPenetrationNormal.y };


        const contacts: { x: number, y: number }[] = [];

        for (const faceA of AFaces) {
            for (const faceB of BFaces) {
                const contact = getLineIntersection(faceA.v1.x, faceA.v1.y, faceA.v2.x, faceA.v2.y, faceB.v1.x, faceB.v1.y, faceB.v2.x, faceB.v2.y);
                if (contact) contacts.push(contact);
            }
        }
        if (contacts.length === 0) return;
        return { contacts, penetrationDepth: leastPenetration, normal: leastPenetrationNormal };
    }

    export function PolygonCircleCollision(data: { A: { x: number, y: number }[], B: { position: { x: number, y: number }, radius: number } }): { contacts: { x: number, y: number }[], penetrationDepth: number, normal: { x: number, y: number } } | undefined {
        const { A, B } = data;

        const APos = vecAvg(...A);

        const contacts: { x: number, y: number }[] = [];

        let leastPenetrationNormal!: { x: number, y: number };
        let leastPenetration: number = Infinity;

        for (let i = 0; i < A.length; i++) {
            const n = { x: A[(i + 1) % A.length].x - A[i % A.length].x, y: -(A[(i + 1) % A.length].y - A[i % A.length].y) };
            const projection = projectCircle(n, B, A);

            if (projection > 0 && projection < leastPenetration) {
                leastPenetration = projection;
                leastPenetrationNormal = n;
            }

            contacts.push(...lineIntersectsCircle(A[i % A.length], A[(i + 1) % A.length], B.position, B.radius));
        }

        if (contacts.length === 0 || leastPenetration === Infinity) return;


        const APosN = { x: APos.x + leastPenetrationNormal.x, y: APos.y + leastPenetrationNormal.y };
        const APosNF = { x: APos.x - leastPenetrationNormal.x, y: APos.y - leastPenetrationNormal.y };

        if ((B.position.x - APosN.x) ** 2 + (B.position.y - APosN.y) ** 2 > (B.position.x - APosNF.x) ** 2 + (B.position.y - APosNF.y) ** 2) leastPenetrationNormal = { x: -leastPenetrationNormal.x, y: -leastPenetrationNormal.y };


        const penetrationDepth = B.radius - distance(vecAvg(...contacts), B.position);

        return { contacts, penetrationDepth, normal: leastPenetrationNormal };
    }

    export function CircleTilemapCollision(data: { A: { position: { x: number, y: number }, radius: number }, B: { tileMap: (1 | 0)[][], position: { x: number, y: number }, tileSize: { x: number, y: number } } }): { contacts: { x: number, y: number }[], penetrationDepth: number, normal: { x: number, y: number } } | undefined {
        const { A, B } = data;
        const { tileMap, position, tileSize } = B;


        const maxX = Math.min(Math.max(Math.ceil(((A.position.x + A.radius) - B.position.x) / tileSize.x), 0), tileMap[0].length);
        const minX = Math.min(Math.max(Math.floor(((A.position.x - A.radius) - B.position.x) / tileSize.x), 0), tileMap[0].length);
        const maxY = Math.min(Math.max(Math.ceil(((A.position.y + A.radius) - B.position.y) / tileSize.y), 0), tileMap.length);
        const minY = Math.min(Math.max(Math.floor(((A.position.y - A.radius) - B.position.y) / tileSize.y), 0), tileMap.length);


        let penetrationDepth = -Infinity;
        let normal!: { x: number, y: number };
        let contacts: { x: number, y: number }[] = [];

        tileMap.reverse();

        for (let y = minY; y < maxY; y++) {
            for (let x = minX; x < maxX; x++) {
                if (tileMap[y][x] !== 1) continue;
                const tileBottomLeft = { x: position.x + tileSize.x * x, y: position.y + tileSize.y * y };

                if (AABBCircleIntersection(A, { position: tileBottomLeft, size: tileSize })) {
                    const tileBottomRight = { x: position.x + tileSize.x * x, y: tileBottomLeft.y };
                    const tileTopLeft = { x: tileBottomLeft.x, y: position.y + tileSize.y * y };
                    const tileTopRight = { x: tileBottomRight.x, y: tileTopLeft.y };


                    let leastDistPoint;
                    let leastDist = Infinity;

                    let d = 0;
                    if ((d = distance(A.position, tileBottomLeft)) < A.radius) {
                        leastDistPoint = tileBottomLeft;
                        leastDist = d;
                    }
                    if ((d = distance(A.position, tileBottomRight)) < A.radius && d < leastDist) {
                        leastDistPoint = tileBottomRight;
                        leastDist = d;
                    }
                    if ((d = distance(A.position, tileTopLeft)) < A.radius && d < leastDist) {
                        leastDistPoint = tileTopLeft;
                        leastDist = d;
                    }
                    if ((d = distance(A.position, tileTopRight)) < A.radius && d < leastDist) {
                        leastDistPoint = tileTopRight;
                        leastDist = d;
                    }

                    if (leastDistPoint && A.radius - leastDist > penetrationDepth) {
                        penetrationDepth = A.radius - leastDist;
                        normal = { x: leastDistPoint.x - A.position.x, y: leastDistPoint.y - A.position.y };

                        continue;
                    }

                    const tileMid = { x: tileBottomLeft.x + tileSize.x / 2, y: tileBottomLeft.y + tileSize.y / 2 };

                    const diff = { x: A.position.x - tileMid.x, y: A.position.y - tileMid.y };

                    const p = (A.radius + tileSize.x / 2) - Math.max(Math.abs(diff.x), Math.abs(diff.y));

                    if (p < penetrationDepth) continue;

                    penetrationDepth = p;
                    normal = { x: Math.abs(diff.x) > Math.abs(diff.y) ? -Math.sign(diff.x) : 0, y: Math.abs(diff.x) <= Math.abs(diff.y) ? -Math.sign(diff.y) : 0 };
                }
            }
        }

        if (!normal) return;

        return { contacts, penetrationDepth, normal: normalizeVec(normal) };
    }

    export function CircleTilemapCollision_(data: { A: { position: { x: number, y: number }, radius: number }, B: { tileMap: (1 | 0)[][], position: { x: number, y: number }, tileSize: { x: number, y: number } } }): { contacts: { x: number, y: number }[], penetrationDepth: number, normal: { x: number, y: number } } | undefined {
        const { A, B } = data;
        const { tileMap, position, tileSize } = B;


        const maxX = Math.min(Math.max(Math.ceil(((A.position.x + A.radius) - B.position.x) / tileSize.x), 0), tileMap[0].length);
        const minX = Math.min(Math.max(Math.floor(((A.position.x - A.radius) - B.position.x) / tileSize.x), 0), tileMap[0].length);
        const maxY = Math.min(Math.max(Math.ceil(((A.position.y + A.radius) - B.position.y) / tileSize.y), 0), tileMap.length);
        const minY = Math.min(Math.max(Math.floor(((A.position.y - A.radius) - B.position.y) / tileSize.y), 0), tileMap.length);


        let penetrationDepth = -Infinity;
        let normal!: { x: number, y: number };
        let contacts: { x: number, y: number }[] = [];
        let pos!: { x: number, y: number };

        tileMap.reverse();

        for (let y = minY; y < maxY; y++) {
            for (let x = minX; x < maxX; x++) {
                if (tileMap[y][x] !== 1) continue;
                const tileBottomLeft = { x: position.x + tileSize.x * x, y: position.y + tileSize.y * y };

                if (AABBCircleIntersection(A, { position: tileBottomLeft, size: tileSize })) {
                    const r = PolygonCircleCollision({
                        A: [
                            { x: tileBottomLeft.x + tileSize.x, y: tileBottomLeft.y + tileSize.y },
                            { x: tileBottomLeft.x + tileSize.x, y: tileBottomLeft.y },
                            { x: tileBottomLeft.x, y: tileBottomLeft.y },
                            { x: tileBottomLeft.x, y: tileBottomLeft.y + tileSize.y }
                        ], B: A
                    });

                    if (!r) continue;

                    if (r.penetrationDepth >= penetrationDepth) {
                        normal = normalizeVec(r.normal);
                        penetrationDepth = r.penetrationDepth;
                        contacts = r.contacts;
                        pos = tileBottomLeft;
                    }
                }
            }
        }

        if (!normal) return;

        pos = { x: pos.x + tileSize.x / 2, y: pos.y + tileSize.y / 2 };
        if (distance({ x: A.position.x + normal.x, y: A.position.y + normal.y }, pos) > distance({ x: A.position.x - normal.x, y: A.position.y - normal.y }, pos)) normal = { x: -normal.x, y: -normal.y };

        return { contacts, penetrationDepth, normal: normalizeVec(normal) };
    }

    export function PolygonTilemapCollision(data: { A: { x: number, y: number }[], B: { tileMap: (1 | 0)[][], position: { x: number, y: number }, tileSize: { x: number, y: number } } }): { contacts: { x: number, y: number }[], penetrationDepth: number, normal: { x: number, y: number } } | undefined {
        const { A, B } = data;
        const { tileMap, position, tileSize } = B;


        let maxX = -Infinity, minX = Infinity, maxY = -Infinity, minY = Infinity;

        for (const vertex of A) {
            if (vertex.x < minX) minX = vertex.x;
            if (vertex.x > maxX) maxX = vertex.x;
            if (vertex.y < minY) minY = vertex.y;
            if (vertex.y > maxY) maxY = vertex.y;
        }

        const polygonLeftBottom = { x: minX, y: minY };
        const polygonSize = { x: maxX - minX, y: maxY - minY };


        maxX = Math.min(Math.max(Math.ceil(maxX / tileSize.x), 0), tileMap[0].length);
        minX = Math.min(Math.max(Math.floor(minX / tileSize.x), 0), tileMap[0].length);
        maxY = Math.min(Math.max(Math.ceil(maxY / tileSize.y), 0), tileMap.length);
        minY = Math.min(Math.max(Math.floor(minY / tileSize.y), 0), tileMap.length);


        let penetrationDepth = -Infinity;
        let normal!: { x: number, y: number };
        let contacts: { x: number, y: number }[] = [];
        let pos!: { x: number, y: number };
        const APos = vecAvg(...A);

        tileMap.reverse();

        for (let y = minY; y < maxY; y++) {
            for (let x = minX; x < maxX; x++) {
                if (tileMap[y][x] === 0) continue;

                const tileBottomLeft = { x: position.x + tileSize.x * x, y: position.y + tileSize.y * y };
                if (AABBIntersection({ position: tileBottomLeft, size: tileSize }, { position: polygonLeftBottom, size: polygonSize })) {
                    const r = AABBPolygonCollision({ position: tileBottomLeft, size: tileSize }, A);

                    if (!r) continue;

                    if (r.penetrationDepth >= penetrationDepth) {
                        normal = normalizeVec(r.normal);
                        penetrationDepth = r.penetrationDepth;
                        contacts = r.contacts;
                        pos = tileBottomLeft;
                    }
                }
            }
        }

        if (!normal) return;

        pos = { x: pos.x + tileSize.x / 2, y: pos.y + tileSize.y / 2 };


        if (distance({ x: APos.x + normal.x, y: APos.y + normal.y }, pos) > distance({ x: APos.x - normal.x, y: APos.y - normal.y }, pos)) normal = { x: -normal.x, y: -normal.y };

        return { contacts, penetrationDepth, normal };
    }


    function AABBPolygonCollision(A: { position: { x: number, y: number }, size: { x: number, y: number } }, B: { x: number, y: number }[]): { contacts: { x: number, y: number }[], penetrationDepth: number, normal: { x: number, y: number } } | undefined {
        const vs = [{ x: A.position.x + A.size.x, y: A.position.y + A.size.y },
        { x: A.position.x + A.size.x, y: A.position.y },
        { x: A.position.x, y: A.position.y },
        { x: A.position.x, y: A.position.y + A.size.y }];

        return PolygonCollision({ A: vs, B });
    }

    function AABBCircleIntersection(A: { radius: number, position: { x: number, y: number } }, B: { position: { x: number, y: number }, size: { x: number, y: number } }): boolean {
        const dx = A.position.x - Math.max(B.position.x, Math.min(A.position.x, B.position.x + B.size.x));
        const dy = A.position.y - Math.max(B.position.y, Math.min(A.position.y, B.position.y + B.size.y));
        return (dx ** 2 + dy ** 2) < (A.radius ** 2);
    }

    function AABBIntersection(A: { position: { x: number, y: number }, size: { x: number, y: number } }, B: { position: { x: number, y: number }, size: { x: number, y: number } }): boolean {
        return A.position.x < B.position.x + B.size.x && A.position.x + A.size.x > B.position.x && A.position.y < B.position.y + B.size.y && A.position.y + A.size.y > B.position.y;
    }

    function projectCircle(axis: { x: number, y: number }, circle: { position: { x: number, y: number }, radius: number }, poly: { x: number, y: number }[]): number {
        let min = Infinity;
        let max = -Infinity;

        for (const vertex of poly) {
            const product = dot(axis, vertex);
            if (product < min) {
                min = product;
            }
            if (product > max) {
                max = product;
            }
        }

        const cmin: number = dot(axis, circle.position) - circle.radius;
        const cmax: number = dot(axis, circle.position) + circle.radius;


        return Math.min(max, cmax) - Math.max(min, cmin);
    }

    function project(axis: { x: number, y: number }, vertices: { x: number, y: number }[]): { min: number, max: number } {
        let min = Infinity;
        let max = -Infinity;

        for (const vertex of vertices) {
            const product = axis.x * vertex.x + axis.y * vertex.y;
            if (product < min) min = product;
            if (product > max) max = product;
        }

        return { min, max };
    }

    function distance(v1: { x: number, y: number }, v2: { x: number, y: number }) {
        return Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2);
    }

    function lineIntersectsCircle(a_: { x: number, y: number }, b_: { x: number, y: number }, position: { x: number, y: number }, radius: number): { x: number, y: number }[] {
        const d = { x: b_.x - a_.x, y: b_.y - a_.y };
        const f = { x: a_.x - position.x, y: a_.y - position.y };

        const a = d.x * d.x + d.y * d.y;
        const b = 2 * (f.x * d.x + f.y * d.y);
        const c = (f.x * f.x + f.y * f.y) - radius ** 2;

        let discriminant = b * b - 4 * a * c;
        if (discriminant >= 0) {
            discriminant = Math.sqrt(discriminant);
            const t1 = (-b - discriminant) / (2 * a);
            const t2 = (-b + discriminant) / (2 * a);

            const ret = [];


            if (t1 >= 0 && t1 <= 1) ret.push({ x: d.x * t1 + a_.x, y: d.y * t1 + a_.y });
            if (t2 >= 0 && t2 <= 1) ret.push({ x: d.x * t2 + a_.x, y: d.y * t2 + a_.y });

            return ret;
        }

        return [];
    }


    function vecAvg(...vecs: { x: number, y: number }[]) {
        const ret = { x: 0, y: 0 };

        for (const vec of vecs) {
            ret.x += vec.x;
            ret.y += vec.y;
        }

        ret.x /= vecs.length;
        ret.y /= vecs.length;

        return ret;
    }


    function normalizeVec(vec: { x: number, y: number }): { x: number, y: number } {
        const mag = (vec.x ** 2 + vec.y ** 2) ** 0.5;
        return { x: vec.x / mag, y: vec.y / mag };
    }

    class Face {
        public v1: { x: number, y: number };
        public v2: { x: number, y: number };
        public normal: { x: number, y: number };
        public constructor(v1: { x: number, y: number }, v2: { x: number, y: number }) {
            this.v1 = v1;
            this.v2 = v2;
            this.normal = normalizeVec({ x: -(v1.y - v2.y), y: v1.x - v2.x });
        }
    }

    function dot(a: { x: number, y: number }, b: { x: number, y: number }): number {
        return a.x * b.x + a.y * b.y;
    }

    //https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect/1968345#1968345
    function getLineIntersection(p0_x: number, p0_y: number, p1_x: number, p1_y: number, p2_x: number, p2_y: number, p3_x: number, p3_y: number): { x: number, y: number } | undefined {
        let s1_x, s1_y, s2_x, s2_y;
        s1_x = p1_x - p0_x;
        s1_y = p1_y - p0_y;
        s2_x = p3_x - p2_x;
        s2_y = p3_y - p2_y;

        const s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
        const t = (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

        if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
            return { x: p0_x + (t * s1_x), y: p0_y + (t * s1_y) };
        }

        return;
    }
};`

const ws = `self.addEventListener('message', (e) => {
    if (!e.data)
        return postMessage(0);
    if (e.data === 'close')
        return close();
    if (e.data.name === 'p') {
        return postMessage(CollisionWorker.PolygonCollision(e.data.data));
    }
    else if (e.data.name === 'c') {
        return postMessage(CollisionWorker.CircleCollision(e.data.data));
    }
    else if (e.data.name === 'pc') {
        return postMessage(CollisionWorker.PolygonCircleCollision(e.data.data));
    }
    else if (e.data.name === 'ct') {
        return postMessage(CollisionWorker.CircleTilemapCollision_(e.data.data));
    }
    else if (e.data.name === 'pt') {
        return postMessage(CollisionWorker.PolygonTilemapCollision(e.data.data));
    }
});
/**
 *
 * @internal
 *
 */
var CollisionWorker;
(function (CollisionWorker) {
    function CircleCollision(data) {
        const { A, B } = data;
        const AB = { x: B.position.x - A.position.x, y: B.position.y - A.position.y };
        const ABMag = Math.sqrt(Math.pow(AB.x, 2) + Math.pow(AB.y, 2));
        if (ABMag > A.radius + B.radius)
            return;
        const penetrationDepth = ABMag != 0 ? A.radius + B.radius - ABMag : Math.max(A.radius, B.radius);
        const normal = ABMag != 0 ? { x: AB.x / ABMag, y: AB.y / ABMag } : { x: 1, y: 0 };
        const contacts = [{ x: normal.x * (A.radius - penetrationDepth / 2 * (A.radius / B.radius)) + A.position.x, y: normal.y * (A.radius - penetrationDepth / 2 * (A.radius / B.radius)) + A.position.y }];
        return { contacts, penetrationDepth, normal };
    }
    CollisionWorker.CircleCollision = CircleCollision;
    function PolygonCollision(data) {
        const { A, B } = data;
        const AFaces = A.map((v, i) => new Face(A[i % A.length], A[(i + 1) % A.length]));
        const BFaces = B.map((v, i) => new Face(B[i % B.length], B[(i + 1) % B.length]));
        const APos = vecAvg(...A);
        const BPos = vecAvg(...B);
        let leastPenetration = Infinity;
        let referenceIndex;
        let referenceCollider;
        let normal = { x: 0, y: 0 };
        for (let i = 0; i < AFaces.length; i++) {
            const aP = project(AFaces[i].normal, A);
            const bP = project(AFaces[i].normal, B);
            const overlap = Math.min(aP.max, bP.max) - Math.max(aP.min, bP.min);
            if (overlap < 0) {
                return;
            }
            else {
                if (overlap <= leastPenetration) {
                    leastPenetration = overlap;
                    referenceIndex = i;
                    referenceCollider = 'A';
                    normal = AFaces[i].normal;
                }
            }
        }
        for (let i = 0; i < BFaces.length; i++) {
            const aP = project(BFaces[i].normal, A);
            const bP = project(BFaces[i].normal, B);
            const overlap = Math.min(aP.max, bP.max) - Math.max(aP.min, bP.min);
            if (overlap < 0) {
                return;
            }
            else {
                if (overlap < leastPenetration) {
                    leastPenetration = overlap;
                    referenceIndex = i;
                    referenceCollider = 'B';
                    normal = BFaces[i].normal;
                }
            }
        }
        let leastPenetrationNormal = referenceCollider === 'A' ? AFaces[referenceIndex].normal : BFaces[referenceIndex].normal;
        const APosN = { x: APos.x + leastPenetrationNormal.x, y: APos.y + leastPenetrationNormal.y };
        const APosNF = { x: APos.x - leastPenetrationNormal.x, y: APos.y - leastPenetrationNormal.y };
        if (distance(BPos, APosN) > distance(BPos, APosNF))
            leastPenetrationNormal = { x: -leastPenetrationNormal.x, y: -leastPenetrationNormal.y };
        const contacts = [];
        for (const faceA of AFaces) {
            for (const faceB of BFaces) {
                const contact = getLineIntersection(faceA.v1.x, faceA.v1.y, faceA.v2.x, faceA.v2.y, faceB.v1.x, faceB.v1.y, faceB.v2.x, faceB.v2.y);
                if (contact)
                    contacts.push(contact);
            }
        }
        if (contacts.length === 0)
            return;
        return { contacts, penetrationDepth: leastPenetration, normal: leastPenetrationNormal };
    }
    CollisionWorker.PolygonCollision = PolygonCollision;
    function PolygonCircleCollision(data) {
        const { A, B } = data;
        const APos = vecAvg(...A);
        const contacts = [];
        let leastPenetrationNormal;
        let leastPenetration = Infinity;
        for (let i = 0; i < A.length; i++) {
            const n = { x: A[(i + 1) % A.length].x - A[i % A.length].x, y: -(A[(i + 1) % A.length].y - A[i % A.length].y) };
            const projection = projectCircle(n, B, A);
            if (projection > 0 && projection < leastPenetration) {
                leastPenetration = projection;
                leastPenetrationNormal = n;
            }
            contacts.push(...lineIntersectsCircle(A[i % A.length], A[(i + 1) % A.length], B.position, B.radius));
        }
        if (contacts.length === 0 || leastPenetration === Infinity)
            return;
        const APosN = { x: APos.x + leastPenetrationNormal.x, y: APos.y + leastPenetrationNormal.y };
        const APosNF = { x: APos.x - leastPenetrationNormal.x, y: APos.y - leastPenetrationNormal.y };
        if (Math.pow((B.position.x - APosN.x), 2) + Math.pow((B.position.y - APosN.y), 2) > Math.pow((B.position.x - APosNF.x), 2) + Math.pow((B.position.y - APosNF.y), 2))
            leastPenetrationNormal = { x: -leastPenetrationNormal.x, y: -leastPenetrationNormal.y };
        const penetrationDepth = B.radius - distance(vecAvg(...contacts), B.position);
        return { contacts, penetrationDepth, normal: leastPenetrationNormal };
    }
    CollisionWorker.PolygonCircleCollision = PolygonCircleCollision;
    function CircleTilemapCollision(data) {
        const { A, B } = data;
        const { tileMap, position, tileSize } = B;
        const maxX = Math.min(Math.max(Math.ceil(((A.position.x + A.radius) - B.position.x) / tileSize.x), 0), tileMap[0].length);
        const minX = Math.min(Math.max(Math.floor(((A.position.x - A.radius) - B.position.x) / tileSize.x), 0), tileMap[0].length);
        const maxY = Math.min(Math.max(Math.ceil(((A.position.y + A.radius) - B.position.y) / tileSize.y), 0), tileMap.length);
        const minY = Math.min(Math.max(Math.floor(((A.position.y - A.radius) - B.position.y) / tileSize.y), 0), tileMap.length);
        let penetrationDepth = -Infinity;
        let normal;
        let contacts = [];
        tileMap.reverse();
        for (let y = minY; y < maxY; y++) {
            for (let x = minX; x < maxX; x++) {
                if (tileMap[y][x] !== 1)
                    continue;
                const tileBottomLeft = { x: position.x + tileSize.x * x, y: position.y + tileSize.y * y };
                if (AABBCircleIntersection(A, { position: tileBottomLeft, size: tileSize })) {
                    const tileBottomRight = { x: position.x + tileSize.x * x, y: tileBottomLeft.y };
                    const tileTopLeft = { x: tileBottomLeft.x, y: position.y + tileSize.y * y };
                    const tileTopRight = { x: tileBottomRight.x, y: tileTopLeft.y };
                    let leastDistPoint;
                    let leastDist = Infinity;
                    let d = 0;
                    if ((d = distance(A.position, tileBottomLeft)) < A.radius) {
                        leastDistPoint = tileBottomLeft;
                        leastDist = d;
                    }
                    if ((d = distance(A.position, tileBottomRight)) < A.radius && d < leastDist) {
                        leastDistPoint = tileBottomRight;
                        leastDist = d;
                    }
                    if ((d = distance(A.position, tileTopLeft)) < A.radius && d < leastDist) {
                        leastDistPoint = tileTopLeft;
                        leastDist = d;
                    }
                    if ((d = distance(A.position, tileTopRight)) < A.radius && d < leastDist) {
                        leastDistPoint = tileTopRight;
                        leastDist = d;
                    }
                    if (leastDistPoint && A.radius - leastDist > penetrationDepth) {
                        penetrationDepth = A.radius - leastDist;
                        normal = { x: leastDistPoint.x - A.position.x, y: leastDistPoint.y - A.position.y };
                        continue;
                    }
                    const tileMid = { x: tileBottomLeft.x + tileSize.x / 2, y: tileBottomLeft.y + tileSize.y / 2 };
                    const diff = { x: A.position.x - tileMid.x, y: A.position.y - tileMid.y };
                    const p = (A.radius + tileSize.x / 2) - Math.max(Math.abs(diff.x), Math.abs(diff.y));
                    if (p < penetrationDepth)
                        continue;
                    penetrationDepth = p;
                    normal = { x: Math.abs(diff.x) > Math.abs(diff.y) ? -Math.sign(diff.x) : 0, y: Math.abs(diff.x) <= Math.abs(diff.y) ? -Math.sign(diff.y) : 0 };
                }
            }
        }
        if (!normal)
            return;
        return { contacts, penetrationDepth, normal: normalizeVec(normal) };
    }
    CollisionWorker.CircleTilemapCollision = CircleTilemapCollision;
    function CircleTilemapCollision_(data) {
        const { A, B } = data;
        const { tileMap, position, tileSize } = B;
        const maxX = Math.min(Math.max(Math.ceil(((A.position.x + A.radius) - B.position.x) / tileSize.x), 0), tileMap[0].length);
        const minX = Math.min(Math.max(Math.floor(((A.position.x - A.radius) - B.position.x) / tileSize.x), 0), tileMap[0].length);
        const maxY = Math.min(Math.max(Math.ceil(((A.position.y + A.radius) - B.position.y) / tileSize.y), 0), tileMap.length);
        const minY = Math.min(Math.max(Math.floor(((A.position.y - A.radius) - B.position.y) / tileSize.y), 0), tileMap.length);
        let penetrationDepth = -Infinity;
        let normal;
        let contacts = [];
        let pos;
        tileMap.reverse();
        for (let y = minY; y < maxY; y++) {
            for (let x = minX; x < maxX; x++) {
                if (tileMap[y][x] !== 1)
                    continue;
                const tileBottomLeft = { x: position.x + tileSize.x * x, y: position.y + tileSize.y * y };
                if (AABBCircleIntersection(A, { position: tileBottomLeft, size: tileSize })) {
                    const r = PolygonCircleCollision({
                        A: [
                            { x: tileBottomLeft.x + tileSize.x, y: tileBottomLeft.y + tileSize.y },
                            { x: tileBottomLeft.x + tileSize.x, y: tileBottomLeft.y },
                            { x: tileBottomLeft.x, y: tileBottomLeft.y },
                            { x: tileBottomLeft.x, y: tileBottomLeft.y + tileSize.y }
                        ], B: A
                    });
                    if (!r)
                        continue;
                    if (r.penetrationDepth >= penetrationDepth) {
                        normal = normalizeVec(r.normal);
                        penetrationDepth = r.penetrationDepth;
                        contacts = r.contacts;
                        pos = tileBottomLeft;
                    }
                }
            }
        }
        if (!normal)
            return;
        pos = { x: pos.x + tileSize.x / 2, y: pos.y + tileSize.y / 2 };
        if (distance({ x: A.position.x + normal.x, y: A.position.y + normal.y }, pos) > distance({ x: A.position.x - normal.x, y: A.position.y - normal.y }, pos))
            normal = { x: -normal.x, y: -normal.y };
        return { contacts, penetrationDepth, normal: normalizeVec(normal) };
    }
    CollisionWorker.CircleTilemapCollision_ = CircleTilemapCollision_;
    function PolygonTilemapCollision(data) {
        const { A, B } = data;
        const { tileMap, position, tileSize } = B;
        let maxX = -Infinity, minX = Infinity, maxY = -Infinity, minY = Infinity;
        for (const vertex of A) {
            if (vertex.x < minX)
                minX = vertex.x;
            if (vertex.x > maxX)
                maxX = vertex.x;
            if (vertex.y < minY)
                minY = vertex.y;
            if (vertex.y > maxY)
                maxY = vertex.y;
        }
        const polygonLeftBottom = { x: minX, y: minY };
        const polygonSize = { x: maxX - minX, y: maxY - minY };
        maxX = Math.min(Math.max(Math.ceil(maxX / tileSize.x), 0), tileMap[0].length);
        minX = Math.min(Math.max(Math.floor(minX / tileSize.x), 0), tileMap[0].length);
        maxY = Math.min(Math.max(Math.ceil(maxY / tileSize.y), 0), tileMap.length);
        minY = Math.min(Math.max(Math.floor(minY / tileSize.y), 0), tileMap.length);
        let penetrationDepth = -Infinity;
        let normal;
        let contacts = [];
        let pos;
        const APos = vecAvg(...A);
        tileMap.reverse();
        for (let y = minY; y < maxY; y++) {
            for (let x = minX; x < maxX; x++) {
                if (tileMap[y][x] === 0)
                    continue;
                const tileBottomLeft = { x: position.x + tileSize.x * x, y: position.y + tileSize.y * y };
                if (AABBIntersection({ position: tileBottomLeft, size: tileSize }, { position: polygonLeftBottom, size: polygonSize })) {
                    const r = AABBPolygonCollision({ position: tileBottomLeft, size: tileSize }, A);
                    if (!r)
                        continue;
                    if (r.penetrationDepth >= penetrationDepth) {
                        normal = normalizeVec(r.normal);
                        penetrationDepth = r.penetrationDepth;
                        contacts = r.contacts;
                        pos = tileBottomLeft;
                    }
                }
            }
        }
        if (!normal)
            return;
        pos = { x: pos.x + tileSize.x / 2, y: pos.y + tileSize.y / 2 };
        if (distance({ x: APos.x + normal.x, y: APos.y + normal.y }, pos) > distance({ x: APos.x - normal.x, y: APos.y - normal.y }, pos))
            normal = { x: -normal.x, y: -normal.y };
        return { contacts, penetrationDepth, normal };
    }
    CollisionWorker.PolygonTilemapCollision = PolygonTilemapCollision;
    function AABBPolygonCollision(A, B) {
        const vs = [{ x: A.position.x + A.size.x, y: A.position.y + A.size.y },
            { x: A.position.x + A.size.x, y: A.position.y },
            { x: A.position.x, y: A.position.y },
            { x: A.position.x, y: A.position.y + A.size.y }];
        return PolygonCollision({ A: vs, B });
    }
    function AABBCircleIntersection(A, B) {
        const dx = A.position.x - Math.max(B.position.x, Math.min(A.position.x, B.position.x + B.size.x));
        const dy = A.position.y - Math.max(B.position.y, Math.min(A.position.y, B.position.y + B.size.y));
        return (Math.pow(dx, 2) + Math.pow(dy, 2)) < (Math.pow(A.radius, 2));
    }
    function AABBIntersection(A, B) {
        return A.position.x < B.position.x + B.size.x && A.position.x + A.size.x > B.position.x && A.position.y < B.position.y + B.size.y && A.position.y + A.size.y > B.position.y;
    }
    function projectCircle(axis, circle, poly) {
        let min = Infinity;
        let max = -Infinity;
        for (const vertex of poly) {
            const product = dot(axis, vertex);
            if (product < min) {
                min = product;
            }
            if (product > max) {
                max = product;
            }
        }
        const cmin = dot(axis, circle.position) - circle.radius;
        const cmax = dot(axis, circle.position) + circle.radius;
        return Math.min(max, cmax) - Math.max(min, cmin);
    }
    function project(axis, vertices) {
        let min = Infinity;
        let max = -Infinity;
        for (const vertex of vertices) {
            const product = axis.x * vertex.x + axis.y * vertex.y;
            if (product < min)
                min = product;
            if (product > max)
                max = product;
        }
        return { min, max };
    }
    function distance(v1, v2) {
        return Math.sqrt(Math.pow((v1.x - v2.x), 2) + Math.pow((v1.y - v2.y), 2));
    }
    function lineIntersectsCircle(a_, b_, position, radius) {
        const d = { x: b_.x - a_.x, y: b_.y - a_.y };
        const f = { x: a_.x - position.x, y: a_.y - position.y };
        const a = d.x * d.x + d.y * d.y;
        const b = 2 * (f.x * d.x + f.y * d.y);
        const c = (f.x * f.x + f.y * f.y) - Math.pow(radius, 2);
        let discriminant = b * b - 4 * a * c;
        if (discriminant >= 0) {
            discriminant = Math.sqrt(discriminant);
            const t1 = (-b - discriminant) / (2 * a);
            const t2 = (-b + discriminant) / (2 * a);
            const ret = [];
            if (t1 >= 0 && t1 <= 1)
                ret.push({ x: d.x * t1 + a_.x, y: d.y * t1 + a_.y });
            if (t2 >= 0 && t2 <= 1)
                ret.push({ x: d.x * t2 + a_.x, y: d.y * t2 + a_.y });
            return ret;
        }
        return [];
    }
    function vecAvg(...vecs) {
        const ret = { x: 0, y: 0 };
        for (const vec of vecs) {
            ret.x += vec.x;
            ret.y += vec.y;
        }
        ret.x /= vecs.length;
        ret.y /= vecs.length;
        return ret;
    }
    function normalizeVec(vec) {
        const mag = Math.pow((Math.pow(vec.x, 2) + Math.pow(vec.y, 2)), 0.5);
        return { x: vec.x / mag, y: vec.y / mag };
    }
    class Face {
        constructor(v1, v2) {
            this.v1 = v1;
            this.v2 = v2;
            this.normal = normalizeVec({ x: -(v1.y - v2.y), y: v1.x - v2.x });
        }
    }
    function dot(a, b) {
        return a.x * b.x + a.y * b.y;
    }
    //https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect/1968345#1968345
    function getLineIntersection(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {
        let s1_x, s1_y, s2_x, s2_y;
        s1_x = p1_x - p0_x;
        s1_y = p1_y - p0_y;
        s2_x = p3_x - p2_x;
        s2_y = p3_y - p2_y;
        const s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
        const t = (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);
        if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
            return { x: p0_x + (t * s1_x), y: p0_y + (t * s1_y) };
        }
        return;
    }
})(CollisionWorker || (CollisionWorker = {}));`

export const worker = URL.createObjectURL(new Blob([ws], { type: 'application/javascript' }));