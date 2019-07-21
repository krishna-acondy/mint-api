import {Request, Response} from 'express';

let currentUserBalance = 500;
let overdraft = 0;
const currentAtmBalance = [
  {value: 5, quantity: 4},
  {value: 10, quantity: 15},
  {value: 20, quantity: 7},
];

export function authenticate(request: Request, response: Response) {
  const pin = request.body['pin'];
  if (pin === 1111) {
    return response.contentType('application/json')
      .status(200)
      .json({currentBalance: currentUserBalance});
  } else {
    return response.contentType('application/json')
      .status(403)
      .json({error: 'Invalid PIN'});
  }
}

export function withdraw(request: Request, response: Response) {
  const requestedAmount = request.body.amount;
  if (requestedAmount > getCurrentAtmBalance()) {
    return response.contentType('application/json')
      .status(500)
      .json({error: 'Insufficient ATM Balance'});
  }
  const newUserBalance = currentUserBalance - requestedAmount;
  if (newUserBalance >= 0) {
    currentUserBalance = newUserBalance;
  } else {
    overdraft = requestedAmount - currentUserBalance;
    currentUserBalance = 0;
  }
  return response.contentType('application/json')
    .status(200)
    .json({ currentBalance: currentUserBalance, overdraft });
}

function getCurrentAtmBalance() {
  let total = 0;
  currentAtmBalance.forEach(denomination => {
    total += denomination.value * denomination.quantity;
  });

  return total;
}
