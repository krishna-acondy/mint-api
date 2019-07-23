import {Request, Response} from 'express';
import { setUserBalance, getUserBalance, setOverdraft, getOverdraft, getCurrentAtmBalance, getAvailableDenominations, setAvailableDenominations } from './database';
export function authenticate(request: Request, response: Response) {
  const pin = request.body.pin;
  if (pin === 1111) {
    return response.contentType('application/json')
      .status(200)
      .json({currentBalance: getUserBalance()});
  } else {
    return response.contentType('application/json')
      .status(403)
      .json({error: 'Invalid PIN'});
  }
}

export function withdraw(request: Request, response: Response) {
  const requestedAmount = request.body.amount;

  handleInsufficientAtmBalance(requestedAmount, response);
  handleMaximumOverdraft(response);
  handleInvalidAmount(requestedAmount, response);

  const newUserBalance = getUserBalance() - requestedAmount;
  const noteMix = getNoteMix(requestedAmount);
  setAvailableDenominations(
    noteMix.numberOfFives,
    noteMix.numberOfTens,
    noteMix.numberOfTwenties);
  if (newUserBalance >= 0) {
    setUserBalance(newUserBalance);
  } else {
    setOverdraft(requestedAmount - getUserBalance());
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

function handleInsufficientAtmBalance(requestedAmount: number, response: Response) {
  if (requestedAmount > getCurrentAtmBalance()) {
    return response.contentType('application/json')
      .status(500)
      .json({error: 'Insufficient ATM Balance'});
  }
}

function handleMaximumOverdraft(response: Response) {
  if (getOverdraft() >= 100 ) {
    return response.contentType('application/json')
      .status(403)
      .json({error: 'Maximum overdraft reached'});
  }
}

function handleInvalidAmount(requestedAmount: number, response: Response) {
  if (requestedAmount % 5 !==0 && requestedAmount % 10 !==0 && requestedAmount % 20 !==0 ) {
    return response.contentType('application/json')
      .status(406)
      .json({error: 'Invalid amount'});
  }
}

function getNoteMix(amount: number) {
  const [fives, tens, twenties] = getAvailableDenominations();
  let numberOfFives = 0, numberOfTens = 0, numberOfTwenties = 0, remainingAmount = 0;
  if (amount >= 100) {
    numberOfTwenties = Math.floor(amount / 20);
    remainingAmount = amount % 20;
    if (numberOfTwenties > twenties.quantity) {
      remainingAmount += (numberOfTwenties - twenties.quantity) * 20;
      numberOfTwenties = twenties.quantity;
    }
    if (remainingAmount) {
      numberOfTens = Math.floor(remainingAmount / 10);
      remainingAmount = remainingAmount % 10;
      if (numberOfTens > tens.quantity) {
        remainingAmount += (numberOfTens - tens.quantity) * 10;
        numberOfTens = tens.quantity;
      }
      if (remainingAmount) {
        numberOfFives = Math.floor(remainingAmount / 5);
      }
    }
  } else {
    const firstChunk = amount / 2;
    const secondChunk = amount / 3;
    const thirdChunk = amount / 6;

    numberOfTwenties = Math.floor(firstChunk / 20);
    remainingAmount = firstChunk % 20;

    if (numberOfTwenties > twenties.quantity) {
      remainingAmount += (numberOfTwenties - twenties.quantity) * 20;
      numberOfTwenties = twenties.quantity;
    }

    remainingAmount += secondChunk;
    numberOfTens = Math.floor(remainingAmount / 10);
    remainingAmount = remainingAmount % 10;

    if (numberOfTens > tens.quantity) {
      remainingAmount += (numberOfTens - tens.quantity) * 10;
      numberOfTens = tens.quantity;
    }

    remainingAmount += thirdChunk;
    numberOfFives = Math.floor(remainingAmount / 5);
    remainingAmount = remainingAmount % 5;

    if (numberOfFives > fives.quantity) {
      remainingAmount += (numberOfFives - fives.quantity) * 5;
      numberOfFives = fives.quantity;
    }
  }

  return { numberOfFives, numberOfTens, numberOfTwenties };
}


