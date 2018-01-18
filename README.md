Token Exchange

Roles:
- Admin
- User

Admin can add ERC20 Token contracts to the exchange and create new token/ether market.

User can deposit and withdraw ethers and allowed tokens for trading.

For each market token/ether we have two OrderBooks. One for buying tokens and one for selling.

We need to implement the linked list for OrderBook, it will allow us to do search with the lowest costs.
For example we need to create SellBook: the cheapest proposition will the first, and so on..
If you want to provide an cheaper offer, you will spent less gas.
If you want to place an sell order with a higher price, you need to go down in the list and pay more gas.

For buying the OrderBook works the same way, main difference the first order is the order with the highest price.

User can place buy order if he has enough ethers.
User can place sell order if he has enough tokens.

If the offers are matched, ClosedOrder event will be fired and balances will be updated
