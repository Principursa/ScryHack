# Plan

on chain:
we want to keep track of bets

interface bet {
id: string;
winningTeam: string;
gameId: string;
odds: string; "1:1"
amount: string;
status: int; Enum // pending, won, lost
commenceTime: string;
}

FE gets data from BE
FE sends game_id and uint bet to smart contract

Transaction 1: payable startBetProcess(gameId, uint bet) -> returns bool (within this funciton we call the oracle to get the game data)
what I need to know

1. gameId (int)
2. bet (float)
3. odds (to calculate the payout) (string "1:1")
4. commence_time (start time of the game) (string)

what needs to happen here?

1. check oracle fee and contract fee
2. do the oracle request
3. store oracle feed id, game_id, bet_id
   return betId

Transaction 2: finalizeBetProcess(betId) called by FE

1. check commence time if bet is still valid for placement

-   if not refund the bet
-   if yes, mark bet as valid
    (optional) 2. call oracle to schedule a function call to check the result of the game ()

checkGameResults(gameId)

User Flow:

1. User selects Game
2. User selects team
3. User selects amount ETH
4. User clicks bet startBetProcess(gameId, uint bet)
5. User confirms transaction finalizeBetProcess(feedID, betId)

# Point Spreads Betting

Better A bets on Warriors with 1eth
Better B bets on Lakers with 1eth

Lakers vs Warriors
Lakers have a point -6 spread
Warriors have a point +6 spread

So that people who bet on Lakers will win if Lakers win by more than 6 points
So that people who bet on Warriors will win if Lakers win by less than 6 points or if Lakers loose

Case 1 (Lakers win by more than 6 points)
Better B wins -> (Total Pot) / Total betters

Case 2 (Lakers win by more than 6 points and we have two winners and three betters)

((Total Pot) / Total betters) / total winners = one winner amount

Have function which calls api to get game result and then pays out winnings
CheckGameResults(gameId)

-   first check if anyone betted on that game
-   if true

    -   get game result
    -   "a:6" or "b"

-   distribute(feedID)
    -   check if any better won
    -   calculate the amount to pay out
