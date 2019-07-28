import {Request, Response} from 'express';
import { setUserBalance, getUserBalance, setOverdraft, getOverdraft, getCurrentAtmBalance, getAvailableDenominations, setAvailableDenominations } from './database';

export function authenticate(request: Request, response: Response) {
  const pin = request.body.pin;
  if (pin === 1111) {
    return response.contentType('application/json')
      .status(200)
      .json({
        name: 'Michael',
        currentBalance: getUserBalance(),
        overdraft: getOverdraft()
      });
  } else {
    return response.contentType('application/json')
      .status(403)
      .json({
        error: 'Invalid PIN'
      });
  }
}

export function withdraw(request: Request, response: Response) {
  const requestedAmount = request.body.amount;
  response.contentType('application/json').status(200);

  handleInvalidAmount(requestedAmount, response);
  handleInsufficientUserBalance(requestedAmount, response);
  handleInsufficientAtmBalance(requestedAmount, response);
  handleMaximumOverdraft(response);

  if (response.statusCode !== 200) {
    return response;
  }
  const newUserBalance = getUserBalance() - requestedAmount;
  const noteMix = getNoteMix(requestedAmount);
  setAvailableDenominations(noteMix);
  if (newUserBalance >= 0) {
    setUserBalance(newUserBalance);
  } else {
    setOverdraft(getOverdraft() + requestedAmount - getUserBalance());
    setUserBalance(0);
  }
  return response.contentType('application/json')
    .status(200)
    .json({
      currentBalance: getUserBalance(),
      overdraft: getOverdraft(),
      noteMix
    });
}

export function balance(request: Request, response: Response) {
  return response.contentType('application/json')
  .status(200)
  .json({
    name: 'Michael',
    currentBalance: getUserBalance(),
    overdraft: getOverdraft()
  });
}

function handleInsufficientAtmBalance(requestedAmount: number, response: Response) {
  if (requestedAmount > getCurrentAtmBalance()) {
    response.contentType('application/json')
      .status(500)
      .json({error: 'Insufficient ATM Balance'});
  }
}

function handleInsufficientUserBalance(requestedAmount: number, response: Response) {
  if (requestedAmount > (getUserBalance() + 100 - getOverdraft())) {
    response.contentType('application/json')
      .status(403)
      .json({error: 'Insufficient funds in account'});
  }
}

function handleMaximumOverdraft(response: Response) {
  if (getOverdraft() >= 100 ) {
    response.contentType('application/json')
      .status(403)
      .json({error: 'Maximum overdraft reached'});
  }
}

function handleInvalidAmount(requestedAmount: number, response: Response) {
  if (requestedAmount % 5 !==0 && requestedAmount % 10 !==0 && requestedAmount % 20 !==0 ) {
    response.contentType('application/json')
      .status(406)
      .json({error: 'Invalid amount'});
  }
}

function getNoteMix(amount: number) {
  let remainingAmount = amount;
  const noteMix = [
    { value: 5, quantity: 0},
    { value: 10, quantity: 0},
    { value: 20, quantity: 0}
  ];
  while(Math.floor(remainingAmount) > 0) {
    const denominations = getAvailableDenominations().reverse();
    denominations.forEach(denomination => {
      const noteCount = getNumberOfNotesFor(denomination.value, remainingAmount);
      noteMix.find(n => n.value === denomination.value).quantity = noteCount;
      remainingAmount -= noteCount * denomination.value;
    });
  }

  return noteMix;
}

function getNumberOfNotesFor(denomination: number, amount: number) {
  const totalCount = getAvailableDenominations().find(d => d.value === denomination).quantity;
  let count = Math.floor(amount / denomination);

  if (count > totalCount) {
    count = totalCount;
  }

  return count;
}


