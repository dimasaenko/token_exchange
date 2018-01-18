Token Exchange

Roles:
- Admin
- User

Admin can add ERC20 Token contracts to the exchange and create new token/ether market

User can deposit and withdraw ethers and allowed tokens for trading.

For each market token/ether we have two OrderBooks for buy and for sell.
We need to implement the linked list for OrderBook, it will allow us to do search with the lowest costs.
For example we need to create SellBook: the cheapest proposition will the first, and so on..
If you want to provide an cheaper offer, you will spent less gas.
If you want to place an order with a higher price, you need to go down in the list and pay more gas.

User can create buy order if he has enough ethers
User can create sell order if he has enough tokens

If the offers is matched, ClosedOrder event will be fired and balances will be updated
