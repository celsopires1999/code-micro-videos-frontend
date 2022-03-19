function* test() {
    yield "react";
    console.log("nome do usuário");
    yield "saga";
}

const iterator = test();

console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
