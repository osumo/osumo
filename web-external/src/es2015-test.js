
class Enumerator {
    constructor(range) {
        this.evens = range.map(x => 2*x);
        this.odds = this.evens.map(x => x + 1);
    }

    showEvens() { console.log(this.evens); }
    showOdds() { console.log(this.odds); }
}

export { Enumerator };

