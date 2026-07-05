const startRoundButton = document.getElementById(`startRoundBtn`);
const dealFlopButton = document.getElementById(`dealFlopBtn`);
const dealTurnButton = document.getElementById(`dealTurnBtn`);
const dealRiverButton = document.getElementById(`dealRiverBtn`);
const showWinnerButton = document.getElementById(`showWinnerBtn`);



let cardRanks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]; // numbers are designated from 2 to 14 // 11 representing J, 12 Q, 13 K and 14 representing Ace;
let cardSuits = ['Heart', `Spade`, `Diamond`, `clubs`];


function shuffle(deck) { // shuffling the cards, to deal the cards again in the next round
    for (let i of cardRanks) {
        for (let j of cardSuits) {
            deck.push({suit : j, rank : i}); // this will push 52 cards in the deck
        }
    }
}


function cardDealer(deck, array, numOfCards) { // this will deal the cards to the specific array with given number of cards
    for (let i = 0; i < numOfCards; i++) { 
        let randomIndex = Math.floor(Math.random() * deck.length);
        array.push(deck[randomIndex]); // pushing the cards in the given array
        deck.splice(randomIndex, 1); // this will remove the card from the deck to avoid dealing the same card twice
    }
}


function handWeightAssigner(cards) { // this will make the program know which is hand is ranked higher and what are hand rankings in poker
    let sortedCards = cards.sort((a, b) => a.rank - b.rank);
    let handWeight = 0; // this number is assigned to every player, this represents how strong a hand is?
    // Hand Rankings
        // high card --> 1
        // pair --> 2
        // two pairs --> 3
        // three of a kind --> 4
        // straight --> 5
        // flush --> 6
        // full house --> 7
        // four of a kind --> 8
        // straight flush --> 9


    // checking for pairs
    let sameRankedCards = []; // Collect cards whose next card has the same rank.  // The number and values of these matches are used to identify pairs and grouped hands.
    for (let i = 0; i < sortedCards.length -1; i++) { // we will check each card rank, if it is equal to next card rank , to indetify pair // we are using sortedCard.length - 1, so that last card is not compared to undefined
        if (sortedCards[i].rank === sortedCards[i+1].rank) { // if the adjacent cards have same rank then the card is pushes into sameRankedCards.
            sameRankedCards.push(sortedCards[i]);
        }
    }
    if (sameRankedCards.length === 0) { // if there are no same ranked cards, than we first assume, the hand is a high card
        handWeight = 1;
    }
    else if (sameRankedCards.length === 1) { // if there is only card in sameRankedCards => there is one pair in the hand
        handWeight = 2;
    }
    else if (sameRankedCards.length === 2) { // if there are 2 cards in sameRankedCard => there are two pairs or three of a kind
        if (sameRankedCards[0].rank !== sameRankedCards[1].rank) { // if both cards are not same => two pairs
            handWeight = 3;
        }
        else if (sameRankedCards[0].rank === sameRankedCards[1].rank) { // if both cards are same => three of a kind
            handWeight = 4;
        }
    }

    //checking for straight
    let isStraight = false;
    let sequencies = 0; // this will keep track, how many cards in the given set are in sequential order
    for (let i = 0; i < sortedCards.length - 1; i++) { //if we have 2 consecutive cards in order, then sequeneces is increased by 1;
        if (sortedCards[i].rank + 1 === sortedCards[i+1].rank) {
            sequencies++;
        }
    }
    if (sequencies === 4) { // if there are four sequence(5 cards in sequence) => straight
        handWeight = 5;
        isStraight = true;
    }
    else if (sortedCards[4].rank === 14 && // for straight of Ace, 2, 3, 4, 5 => we need a seperate condition as ace is defined as 14
             sortedCards[0].rank === 2 &&
             sortedCards[1].rank === 3 &&
             sortedCards[2].rank === 4 &&
             sortedCards[3].rank === 5) {
                handWeight = 5;
                isStraight = true;
    }
    
    // checking for flush
    let sameSuitedCards = 0; // this will keep track of how many same suited cards are in given set of cards. this will give one less value than actually given number of same suited cards in the given set
    for(let i = 0; i < cards.length -1; i++) {
        if (sortedCards[i].suit === sortedCards[i+1].suit) { // if suit of current cards is same as next card, this increment the sameSuitedCards by 1
            sameSuitedCards++;
        }
    }
    if (sameSuitedCards === 4){ // if there are 4 sequencies of same suited cards => flush
        handWeight = 6
    }

    //checking full house and four of a kind
    if (sameRankedCards.length === 3) { // if sameRankedCards have 3 cards => full house OR 4 of kind
        if (sameRankedCards[0].rank !== sameRankedCards[1].rank || // if all the cards in sameRankedCards are NOT SAME => FULL HOUSE
            sameRankedCards[1].rank !== sameRankedCards[2].rank) {
                handWeight = 7;
        }
        else { // only other possiblity is four of a kind
            handWeight = 8;
        }

    }

    // checking for straight flush 
    if (handWeight === 6 && isStraight === true) { // if handWeight is 6(flush) and isStraight
        handWeight = 9;
    }
    
    return {sameRankedCards, handWeight};
}


function handMaker (communityCards, playerCards) { // this will take three cards from community cards and 2 player cards, try to make the best hand for player
    let bestHand = []; // this stores the temporary best Hand that have been found until now
    let bestHandWeight = 0; // this stores the weight of best hand

    // condition when ALL CARDS are COMMUNITY CARDS and none of the player cards are used
    let hand = [...communityCards]; // initializing a temporary variabl that can be assigned different values and can be checked against bestHand
    if (handWeightAssigner(hand).handWeight > bestHandWeight) { //if the hand made is better than the best hand, then this is the best Hand
        bestHandWeight = handWeightAssigner(hand).handWeight;
        bestHand = hand;
    }
    else if (handWeightAssigner(hand).handWeight === bestHandWeight) {
        bestHand = compareHands(bestHand, hand);
        if (bestHand === `draw`) { //when calling compareHands, it returns `draw`, if both hands are same, that makes best hand string. to change back to array of card, we assign bestHand to hand. 
            bestHand = hand;
        }
    }


    // condition : when we use just ONE hole card and rest FOUR are from community cards
    for (let i = 0; i < 2; i++) {
        for (let j = i+1; j < 3; j++) {
            for (let k = j+1; k < 4; k++) {
                for (let l = k+1; l < 5; l++) {
                    for (let playerCard of playerCards) {
                        hand = [];
                        hand.push(playerCard);
                        hand.push(communityCards[i]);
                        hand.push(communityCards[j]);
                        hand.push(communityCards[k]);
                        hand.push(communityCards[l]);

                        if (handWeightAssigner(hand).handWeight > bestHandWeight) { //if the hand made is better than the best hand, then this is the best Hand
                            bestHandWeight = handWeightAssigner(hand).handWeight;
                            bestHand = hand;
                        }
                        else if (handWeightAssigner(hand).handWeight === bestHandWeight) {
                            bestHand = compareHands(bestHand, hand);
                            if (bestHand === `draw`) { //when calling compareHands, it returns `draw`, if both hands are same, that makes best hand string. to change back to array of card, we assign bestHand to hand. 
                                bestHand = hand;
                            }
                        }


                    }
                    
                }
            }
        }
    }


    for (let i = 0; i < 3; i++) { // trying all the possible 3 cards drawing from community cards
        for (let j = i+1;j < 4; j++) {
            for (let k = j+1; k < 5; k++) {
                hand = [...playerCards]; // creating a new array that currently is same as playerCards
                hand.push(communityCards[i]);
                hand.push(communityCards[j]);
                hand.push(communityCards[k]);

                if (handWeightAssigner(hand).handWeight > bestHandWeight) { //if the hand made is better than the best hand, then this is the best Hand
                    bestHandWeight = handWeightAssigner(hand).handWeight;
                    bestHand = hand;
                }
                else if (handWeightAssigner(hand).handWeight === bestHandWeight) {
                    bestHand = compareHands(bestHand, hand);
                    if (bestHand === `draw`) { //when calling compareHands, it returns `draw`, if both hands are same, that makes best hand string. to change back to array of card, we assign bestHand to hand. 
                        bestHand = hand;
                    }
                }
            }
        }
    }



    return bestHand;
}


function compareHands(cardSet1, cardSet2) { //this compares 2 sets of 5 cards and returns the card set that is superior
    if (handWeightAssigner(cardSet1).handWeight > handWeightAssigner(cardSet2).handWeight) { //comparing handweights
        return cardSet1;
    }
    else if (handWeightAssigner(cardSet1).handWeight < handWeightAssigner(cardSet2).handWeight) {
        return cardSet2;
    }
    else if (handWeightAssigner(cardSet1).handWeight === handWeightAssigner(cardSet2).handWeight) { // if handweights are same we call tieBreaker function
        return (tieBreaker(cardSet1, cardSet2));
    }
}


function tieBreaker(cardSet1, cardSet2) { //if two cards have same handweight, to break the tie and decide clear winnner, this fucntion is used
    let result = ``;
    let handWeight = handWeightAssigner(cardSet1).handWeight; // since the handweight of both the sets is same, if can just use one handweight
    
    function comparisionByHighestCard(cardSet1, cardSet2) { // comparing the largest card rank and going towards lowest
        let tempVar = ``; // this is just temporary variable, if not declared then at loops stops, even if one of the card is same
        for (let i = cardSet1.length - 1; i >= 0; i--) {
            if (cardSet1[i].rank > cardSet2[i].rank) {
                tempVar = cardSet1;
                break;
            }
            else if (cardSet1[i].rank < cardSet2[i].rank) {
                tempVar = cardSet2;
                break;
            }
            else {
                tempVar = `draw`; // if ranks of all the cards is same then draw is returned
            }
        }
        return tempVar;
    }

    if (handWeight === 1 || handWeight === 6) { //high card, straight, flush, straight flush
        result = comparisionByHighestCard(cardSet1, cardSet2);
    }
    else if (handWeight === 2 || handWeight === 3 || handWeight === 4 || handWeight === 8) { //pair, two pairs, three of a kind, four of kind
        let sameRankedCards1 = handWeightAssigner(cardSet1).sameRankedCards;
        let sameRankedCards2 = handWeightAssigner(cardSet2).sameRankedCards;
        let tempResult = comparisionByHighestCard(sameRankedCards1, sameRankedCards2);


        if (tempResult === sameRankedCards1) {
            result = cardSet1;
        }
        else if (tempResult === sameRankedCards2) {
            result = cardSet2;
        }
        else if (tempResult === `draw`) {
            result = comparisionByHighestCard(cardSet1, cardSet2);
        }
    }
    else if (handWeight === 7) { // full house need special handling

        function findThreeOfKind (element, index, array) { // function to find what card if three of a kind
            if (index < 2 && element.rank == array[index + 1].rank) { // if we have full house, two card in sameRankedCards will be same ranked and that is three of a kind
                return true;
            }
            else {
                return false;
            }
        }

        let tOfKindSet1 = handWeightAssigner(cardSet1).sameRankedCards.filter(findThreeOfKind);
        let tOfKindSet2 = handWeightAssigner(cardSet2).sameRankedCards.filter(findThreeOfKind);

        if (tOfKindSet1[0].rank > tOfKindSet2[0].rank) {
            result = cardSet1;
        }
        else if (tOfKindSet1[0].rank < tOfKindSet2[0].rank) {
            result = cardSet2;
        }
        else { // if both card sets have same three of kind then we compare pairs, since it is full house, we can just compare the cards
            result = comparisionByHighestCard(cardSet1, cardSet2);
        }
    }

    
    else if (handWeight === 5 || handWeight === 9) {
        const effectiveHighCard1 =
            getEffectiveStraightHighCard(cardSet1);

        const effectiveHighCard2 =
            getEffectiveStraightHighCard(cardSet2);

        if (effectiveHighCard1 > effectiveHighCard2) {
            result = cardSet1;
        }
        else if (effectiveHighCard1 < effectiveHighCard2) {
            result = cardSet2;
        }
        else {
            result = `draw`;
        }
    }

    function getEffectiveStraightHighCard(cards) {
        const isAceLowStraight =
            cards[0].rank === 2 &&
            cards[1].rank === 3 &&
            cards[2].rank === 4 &&
            cards[3].rank === 5 &&
            cards[4].rank === 14;

        if (isAceLowStraight) {
            return 5;
        }

        return cards[4].rank;
    }

    return result;

}



//Now Integrating HTML // for now we are just using buttons and console for the display

let gameState = { //tracking the progress of the game
    deck : [], // every time a new round starts, we shuffle the deck
    player1Cards : [],
    player2Cards : [], 
    communityCards :[],
    pot : 0,
    stage : ``,
    winner : null
};

startRoundButton.addEventListener("click", () => {
    if (gameState.stage === ``) {
        shuffle(gameState.deck);
        gameState.player1Cards = [];
        gameState.player2Cards = [];
        cardDealer(gameState.deck, gameState.player1Cards, 2);
        cardDealer(gameState.deck, gameState.player2Cards, 2);
        gameState.communityCards = [];
        gameState.stage = 'preflop';
        document.getElementById(``)
        console.log(gameState.player1Cards);
        console.log(gameState.player2Cards);
    }
});



dealFlopButton.addEventListener("click", (event) => {
    if (gameState.stage === `preflop`) {
        cardDealer(gameState.deck, gameState.communityCards, 3);
        gameState.stage = `flop`;
        console.log(gameState.communityCards);
    }
    
});


dealTurnButton.addEventListener("click", () => {
    if (gameState.stage === `flop`) {
        cardDealer(gameState.deck, gameState.communityCards, 1);
        gameState.stage = `turn`;
        console.log(gameState.communityCards);
    }
})

dealRiverButton.addEventListener("click", () => {
    if (gameState.stage === `turn`) {
        cardDealer(gameState.deck, gameState.communityCards, 1);
        gameState.stage = `river`;
        console.log(gameState.communityCards);
    }
})

showWinnerButton.addEventListener("click", () => {
    if (gameState.stage === `river`) {
        let player1Hand = handMaker(gameState.communityCards, gameState.player1Cards);
        let player2Hand = handMaker(gameState.communityCards, gameState.player2Cards);
        let winner = compareHands(player1Hand, player2Hand);
    }  
    console.log(winner);
})