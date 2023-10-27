export const Cards = {
    Wasabi: "wasabi",
    EggNigiri: "eggNigiri",
    SalmonNigiri: "salmonNigiri",
    SquidNigiri: "squidNigiri",
    Sashimi: "sashimi",
    Tempura: "tempura",
    Dumpling: "dumpling",
    MakiRoll: "makiRoll",
    TwoMakiRoll: "twoMakiRoll",
    ThreeMakiRoll: "threeMakiRoll",
    Pudding: "pudding",
    Chopsticks: "chopsticks",
}

export function getHandSize(numPlayers: number): number {
    switch (numPlayers) {
        case 2:
            return 10;
        case 3:
            return 9;
        case 4:
            return 8;
        case 5:
            return 7;
        default:
            throw new Error("Only allowed 2 to 5 players.");
    }
}

const CardCount = new Map([
    [Cards.Wasabi, 6],
    [Cards.EggNigiri, 5],
    [Cards.SalmonNigiri, 10],
    [Cards.SquidNigiri, 5],
    [Cards.Sashimi, 14],
    [Cards.Tempura, 14],
    [Cards.Dumpling, 14],
    [Cards.MakiRoll, 6],
    [Cards.TwoMakiRoll, 12],
    [Cards.ThreeMakiRoll, 8],
    [Cards.Pudding, 10],
    [Cards.Chopsticks, 4],
])

// Generate full deck to copy from
const deck: string[] = []
for (const [key, value] of CardCount) {
    for (let i = 0; i < value; i++) {
        deck.push(key)
    }
}

function shuffle(list: string[]) {
    return list.sort((a, b) => 0.5 - Math.random());
}

function isNigiri(card: string) {
    return card === Cards.EggNigiri || card === Cards.SalmonNigiri || card === Cards.SquidNigiri
}

/**
 * Gets a list of all of the cards shuffled up
 * @returns {string[]} a list of all of the cards shuffled up
 */
export function getDeck(): string[] {
    return shuffle([...deck])
}

export class Hand {
    cards: string[]
    constructor(cards: string[]) {
        this.cards = cards;
    }

    removeCard(card: string) {
        const index = this.cards.indexOf(card);
        if (index === -1) {
            throw new Error(`Card ${card} is not part of hand.`);
        }
        this.cards.splice(index, 1);
    }

    uniqueCards() {
        return [...new Set(this.cards)]
    }

    addChopsticks() {
        this.cards.push(Cards.Chopsticks);
    }
}

/**
 * @param {string[]} cards
 * @returns {number} count of the pudding cards in list
 */
export function getPuddingCount(cards: string[]) {
    return cards.filter(card => card === Cards.Pudding).length;
}

/**
 * Doesn't score pudding or maki rolls
 * @param {string[]} cards the cards in the order they were placed
 * @returns {number} the resulting score
 */
export function calcScore(cards: string[]): number {
    let score = 0;
    // Score dumplings
    let dumplingCount = cards.filter(card => card === Cards.Dumpling).length;
    if (dumplingCount === 1) {
        score += 1;
    } else if (dumplingCount === 2) {
        score += 3;
    } else if (dumplingCount === 3) {
        score += 6;
    } else if (dumplingCount === 4) {
        score += 10;
    } else if (dumplingCount >= 5) {
        score += 15;
    }
    // Score sashimi
    let sashimiCount = cards.filter(card => card === Cards.Sashimi).length;
    score += Math.floor(sashimiCount / 3) * 10;
    // Score tempura
    let tempuraCount = cards.filter(card => card === Cards.Tempura).length;
    score += Math.floor(tempuraCount / 2) * 5;
    // Score squid nigiri
    let squidCount = cards.filter(card => card === Cards.SquidNigiri).length;
    score += squidCount * 3;
    // Score salmon nigiri
    let salmonCount = cards.filter(card => card === Cards.SalmonNigiri).length;
    score += salmonCount * 2;
    // Score egg nigiri
    let eggCount = cards.filter(card => card === Cards.EggNigiri).length;
    score += eggCount;
    // Score wasabi
    let wasabiIndex = cards.indexOf(Cards.Wasabi);
    let subArr = [...cards];
    while (wasabiIndex !== -1) {
        subArr = subArr.slice(wasabiIndex + 1);
        for (const [index, card] of subArr.entries()) {
            if (isNigiri(card)) {
                // Only need to increment double the normal score since we already counted the nigiri
                // Remove nigiri from list so it won't be double counted
                subArr.splice(index, 1);
                if (card === Cards.SquidNigiri) {
                    score += 6;
                }
                else if (card === Cards.SalmonNigiri) {
                    score += 4;
                }
                else if (card === Cards.EggNigiri) {
                    score += 2;
                }
                break;
            }
        }
        wasabiIndex = subArr.indexOf(Cards.Wasabi);
    }
    return score;
}

/**
 * Calculates the scores for maki rolls and all of the other cards except for puddings
 * @param {string[][]} hands a list of all of the hands
 * @returns {number[]} returns a list of the scores for the hands in the same order as the input
 */
export function calcRound(hands: string[][]): number[] {
    let scores: number[] = [];
    for (const _ of hands) {
        scores.push(0);
    }
    // Get 1st and second place maki count
    let makiCounts = hands.map(hand => {
        let makiCount = 0;
        for (const card of hand) {
            if (card === Cards.MakiRoll) { makiCount += 1 }
            else if (card === Cards.TwoMakiRoll) { makiCount += 2 }
            else if (card === Cards.ThreeMakiRoll) { makiCount += 3 }
        }
        return makiCount;
    });
    let makiCountsCopy = [...makiCounts];
    makiCountsCopy.sort();
    makiCountsCopy.reverse();
    let firstPlaceCount = makiCountsCopy[0];
    let secondPlaceCount = makiCountsCopy[1];
    if (firstPlaceCount === secondPlaceCount) {
        // No second place prize, split first place among others
        let indexes = [];
        for (const [i, count] of makiCounts.entries()) {
            if (count === firstPlaceCount) {
                indexes.push(i);
            }
        }
        for (const index of indexes) {
            scores[index] += Math.floor(6 / indexes.length);
        }
    } else if (secondPlaceCount === makiCountsCopy[2]) {
        scores[makiCounts.indexOf(firstPlaceCount)] += 6;
        // Split second place among others
        let indexes = [];
        for (const [i, count] of makiCounts.entries()) {
            if (count === secondPlaceCount) {
                indexes.push(i);
            }
        }
        for (const index of indexes) {
            scores[index] += Math.floor(3 / indexes.length);
        }
    } else {
        let firstIndex = makiCounts.indexOf(firstPlaceCount);
        let secondIndex = makiCounts.indexOf(secondPlaceCount);
        scores[firstIndex] += 6;
        scores[secondIndex] += 3;
    }
    for (const [i, hand] of hands.entries()) {
        scores[i] += calcScore(hand);
    }
    return scores;
}

export function calcPuddings(hands: string[][]): number[] {
    let scores = [];
    for (const _ of hands) {
        scores.push(0);
    }
    let puddingCounts = hands.map(hand => {
        return hand.filter(card => card === Cards.Pudding).length;
    });
    let puddingCountsCopy = [...puddingCounts];
    puddingCountsCopy.sort();
    let winCount = puddingCountsCopy[puddingCountsCopy.length - 1];
    let loseCount = puddingCountsCopy[0];
    if (winCount !== loseCount) {
        // Some elements are different so split if needed
        let winIndexes = [];
        let loseIndexes = [];
        for (const [i, count] of puddingCounts.entries()) {
            if (count === winCount) {
                winIndexes.push(i);
            } else if (count === loseCount) {
                loseIndexes.push(i);
            }
        }
        console.log(winIndexes);
        console.log(loseIndexes);
        for (const index of winIndexes) {
            scores[index] += Math.floor(6 / winIndexes.length);
        }
        for (const index of loseIndexes) {
            scores[index] -= Math.floor(6 / winIndexes.length);
        }
    }
    return scores;
}

export const forTesting = {
    isNigiri,

}