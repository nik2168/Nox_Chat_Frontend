// const a = new Map()
// a.set("a", 1)
// a.set("b", 2)

// const obj = Object.fromEntries(a.entries());

const obj = {
    name : "nik",
    age : "20",
}

const map = new Map(Object.entries(obj))

console.log(map);