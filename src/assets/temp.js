let a = [{
    name: "seen",
    class: "12th"
},
{
    name: "online",
    class: "10th"
}
]

console.log(a)

const result = a.map((i) => {
    if(i.name === "online"){
        i["name"] = "seen"
    }
    return i
})

console.log(result)