// const { Cards, CardKeys, CardCount, isNigiri } = require("../src");
import { Cards, getDeck, Hand, calcScore, calcRound, getPuddingCount, calcPuddings, getHandSize } from "../src";
import { forTesting } from "../src"
// const { describe, expect, test } = require("@jest/globals");
import { describe, expect, test } from '@jest/globals';
const isNigiri = forTesting.isNigiri;

describe('isNigiri', () => {
    test('returns true', () => {
        let nigiri = [
            Cards.EggNigiri,
            Cards.SalmonNigiri,
            Cards.SquidNigiri,
        ]
        nigiri.forEach(card => {
            expect(isNigiri(card)).toBe(true);
        });
    });
    test('returns false', () => {
        let notNigiri = [
            Cards.Wasabi,
            Cards.Sashimi,
            Cards.Tempura,
            Cards.Dumpling,
            Cards.MakiRoll,
            Cards.Pudding,
            Cards.Chopsticks,
        ]
        notNigiri.forEach(card => {
            expect(isNigiri(card)).toBe(false);
        });
    });
});
describe('getDeck', () => {
    test('returns different list', () => {
        const deck1 = getDeck();
        const deck2 = getDeck();
        expect(deck1 === deck2).toBeFalsy()
    });
    test('returns list of 108', () => {
        const deck = getDeck();
        expect(deck.length).toEqual(108);
    });
});
describe('Hand', () => {
    describe('removeCard', () => {
        test('removes none if no match', () => {
            const hand = new Hand([Cards.Wasabi]);
            expect(() => {
                hand.removeCard(Cards.SquidNigiri);
            }).toThrow();
        });
        test('throws error if no cards match', () => {
            const hand = new Hand([Cards.Wasabi]);
            expect(hand.cards.length).toEqual(1);
            try {
                hand.removeCard(Cards.SquidNigiri);
            } catch (e) { }
            expect(hand.cards.length).toEqual(1);
        });
        test('decreases length by 1', () => {
            const hand = new Hand([Cards.Wasabi]);
            expect(hand.cards.length).toEqual(1);
            hand.removeCard(Cards.Wasabi);
            expect(hand.cards.length).toEqual(0);
        });
    });
    describe('uniqueCards', () => {
        test('returns simplified list', () => {
            const hand = new Hand([Cards.Wasabi, Cards.Wasabi, Cards.Wasabi,]);
            const uniqueCards = hand.uniqueCards();
            expect(uniqueCards.length).toEqual(1);
            expect(uniqueCards.length).toBeLessThanOrEqual(hand.cards.length);
        });
        test('returns same list if all unique', () => {
            const hand = new Hand([Cards.Wasabi, Cards.MakiRoll, Cards.Tempura,]);
            const uniqueCards = hand.uniqueCards();
            expect(uniqueCards.length).toEqual(3);
            expect(uniqueCards.length).toBeLessThanOrEqual(hand.cards.length);
        });
    });
    describe('addChopsticks', () => {
        test('increases length by 1', () => {
            const hand = new Hand([Cards.Wasabi, Cards.MakiRoll, Cards.Tempura,]);
            expect(hand.cards.length).toEqual(3);
            hand.addChopsticks();
            expect(hand.cards.length).toEqual(4);
        });
        test('adds chopsticks card to hand', () => {
            const hand = new Hand([Cards.Wasabi, Cards.MakiRoll, Cards.Tempura,]);
            expect(hand.cards.includes(Cards.Chopsticks)).toBe(false);
            hand.addChopsticks();
            expect(hand.cards.includes(Cards.Chopsticks)).toBe(true);
        });
    });
});
describe('getPuddingCount', () => {
    test('returns count of all pudding cards in hand', () => {
        let count = getPuddingCount([Cards.Pudding, Cards.Wasabi, Cards.MakiRoll, Cards.Tempura, Cards.Pudding,]);
        expect(count).toEqual(2);
        count = getPuddingCount([]);
        expect(count).toEqual(0);
        count = getPuddingCount([Cards.MakiRoll,]);
        expect(count).toEqual(0);
    });
});
describe('calcScore', () => {
    test('calculates dumplings', () => {
        let score = calcScore([Cards.Dumpling,]);
        expect(score).toEqual(1);
        score = calcScore([Cards.Dumpling, Cards.Dumpling, Cards.Dumpling,]);
        expect(score).toEqual(6);
        score = calcScore([Cards.Dumpling, Cards.Dumpling, Cards.Dumpling, Cards.Dumpling, Cards.Dumpling, Cards.Dumpling,]);
        expect(score).toEqual(15);
        score = calcScore([Cards.Dumpling, Cards.Dumpling, Cards.Dumpling, Cards.Dumpling, Cards.Dumpling,]);
        expect(score).toEqual(15);
    });
    test('calculates sashimi', () => {
        let score = calcScore([Cards.Sashimi, Cards.Sashimi,]);
        expect(score).toEqual(0);
        score = calcScore([Cards.Sashimi, Cards.Sashimi, Cards.Sashimi, Cards.Sashimi, Cards.Sashimi, Cards.Sashimi,]);
        expect(score).toEqual(20);
        score = calcScore([Cards.Sashimi, Cards.Sashimi, Cards.Sashimi,]);
        expect(score).toEqual(10);
    });
    test('calculates tempura', () => {
        let score = calcScore([Cards.Tempura, Cards.Tempura,]);
        expect(score).toEqual(5);
        score = calcScore([Cards.Tempura,]);
        expect(score).toEqual(0);
        score = calcScore([Cards.Tempura, Cards.Tempura, Cards.Tempura, Cards.Tempura,]);
        expect(score).toEqual(10);
    });
    test('calculates multiple wasabi with nigiri', () => {
        let score = calcScore([Cards.Wasabi, Cards.SquidNigiri, Cards.Wasabi, Cards.SalmonNigiri, Cards.EggNigiri]);
        expect(score).toEqual(16);
        score = calcScore([Cards.SquidNigiri, Cards.Wasabi, Cards.SalmonNigiri, Cards.Wasabi, Cards.EggNigiri]);
        expect(score).toEqual(12);
        score = calcScore([Cards.SalmonNigiri, Cards.SquidNigiri, Cards.Wasabi, Cards.Wasabi, Cards.EggNigiri]);
        expect(score).toEqual(8);
    });
    test('calculates wasabi with nigiri', () => {
        let score = calcScore([Cards.Wasabi, Cards.SquidNigiri, Cards.SalmonNigiri, Cards.EggNigiri]);
        expect(score).toEqual(12);
        score = calcScore([Cards.SquidNigiri, Cards.Wasabi, Cards.SalmonNigiri, Cards.EggNigiri]);
        expect(score).toEqual(10);
        score = calcScore([Cards.SquidNigiri, Cards.SalmonNigiri, Cards.Wasabi, Cards.EggNigiri]);
        expect(score).toEqual(8);
    });
    test('calculates wasabi without nigiri', () => {
        let score = calcScore([Cards.Wasabi]);
        expect(score).toEqual(0);
        score = calcScore([Cards.SquidNigiri, Cards.Wasabi]);
        expect(score).toEqual(3);
    });
    test('calculates nigiri', () => {
        let score = calcScore([Cards.SquidNigiri, Cards.SalmonNigiri, Cards.EggNigiri]);
        expect(score).toEqual(6);
        score = calcScore([Cards.SquidNigiri,]);
        expect(score).toEqual(3);
        score = calcScore([Cards.SalmonNigiri,]);
        expect(score).toEqual(2);
        score = calcScore([Cards.EggNigiri,]);
        expect(score).toEqual(1);
    });
    test('ignores pudding', () => {
        let score = calcScore([Cards.Pudding,]);
        expect(score).toEqual(0);
    });
});
describe('calcRound', () => {
    test('calculates maki rolls', () => {
        let hands = [
            [Cards.MakiRoll,],
            [Cards.ThreeMakiRoll, Cards.MakiRoll,],
            [Cards.MakiRoll, Cards.MakiRoll,],
            [Cards.MakiRoll, Cards.MakiRoll, Cards.MakiRoll,],
        ];
        let scores = calcRound(hands);
        expect(scores[0]).toEqual(0);
        expect(scores[1]).toEqual(6);
        expect(scores[2]).toEqual(0);
        expect(scores[3]).toEqual(3);
    });
    test('calculates maki rolls and other cards', () => {
        let hands = [
            [Cards.MakiRoll,],
            [Cards.ThreeMakiRoll, Cards.MakiRoll,],
            [Cards.MakiRoll, Cards.MakiRoll, Cards.Dumpling,],
            [Cards.MakiRoll, Cards.MakiRoll, Cards.MakiRoll, Cards.Sashimi, Cards.Sashimi, Cards.Sashimi],
        ];
        let scores = calcRound(hands);
        expect(scores[0]).toEqual(0);
        expect(scores[1]).toEqual(6);
        expect(scores[2]).toEqual(1);
        expect(scores[3]).toEqual(13);
    });
    test('calculates maki rolls with tie for first', () => {
        let hands = [
            [Cards.MakiRoll,],
            [Cards.ThreeMakiRoll, Cards.MakiRoll,],
            [Cards.ThreeMakiRoll, Cards.MakiRoll,],
            [Cards.ThreeMakiRoll, Cards.MakiRoll,],
        ];
        let scores = calcRound(hands);
        expect(scores[0]).toEqual(0);
        expect(scores[1]).toEqual(2);
        expect(scores[2]).toEqual(2);
        expect(scores[3]).toEqual(2);
    });
    test('calculates maki rolls with tie for second', () => {
        let hands = [
            [Cards.MakiRoll,],
            [Cards.ThreeMakiRoll, Cards.MakiRoll,],
            [Cards.ThreeMakiRoll,],
            [Cards.ThreeMakiRoll,],
        ];
        let scores = calcRound(hands);
        expect(scores[0]).toEqual(0);
        expect(scores[1]).toEqual(6);
        expect(scores[2]).toEqual(1);
        expect(scores[3]).toEqual(1);
    });
    test('calculates maki rolls with 2 hands', () => {
        let hands = [
            [Cards.MakiRoll,],
            [Cards.ThreeMakiRoll, Cards.MakiRoll,],
        ];
        let scores = calcRound(hands);
        expect(scores[0]).toEqual(3);
        expect(scores[1]).toEqual(6);
    });
    test('ignores pudding', () => {
        let score = calcRound([[Cards.MakiRoll], [Cards.MakiRoll], [], [Cards.Pudding,]]);
        expect(score[0]).toEqual(3);
        expect(score[1]).toEqual(3);
        expect(score[2]).toEqual(0);
        expect(score[3]).toEqual(0);
    });
});
describe('calcPuddings', () => {
    test('returns correct on tie winner tie loser', () => {
        let hands = [
            [Cards.Pudding,],
            [Cards.Pudding, Cards.Pudding,],
            [Cards.Pudding,],
            [Cards.Pudding, Cards.Pudding,],
        ];
        let scores = calcPuddings(hands);
        expect(scores[0]).toEqual(-3);
        expect(scores[1]).toEqual(3);
        expect(scores[2]).toEqual(-3);
        expect(scores[3]).toEqual(3);
    });
    test('returns correct on one winner one loser', () => {
        let hands = [
            [Cards.Pudding,],
            [],
            [Cards.Pudding,],
            [Cards.Pudding, Cards.Pudding,],
        ];
        let scores = calcPuddings(hands);
        expect(scores[0]).toEqual(0);
        expect(scores[1]).toEqual(-6);
        expect(scores[2]).toEqual(0);
        expect(scores[3]).toEqual(6);
    });
});
describe('getHandSize', () => {
    test('gets correct hand size', () => {
        expect(getHandSize(2)).toEqual(10);
        expect(getHandSize(3)).toEqual(9);
        expect(getHandSize(4)).toEqual(8);
        expect(getHandSize(5)).toEqual(7);
    });
    test('throws error on invalid input', () => {
        expect(() => {
            getHandSize(1);
        }).toThrow();
        expect(() => {
            getHandSize(6);
        }).toThrow();
    });
});