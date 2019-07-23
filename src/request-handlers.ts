import {Request, Response} from 'express';
import { setUserBalance, getUserBalance, setOverdraft, getOverdraft, getCurrentAtmBalance } from './database';
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
  if (requestedAmount > getCurrentAtmBalance()) {
    return response.contentType('application/json')
      .status(500)
      .json({error: 'Insufficient ATM Balance'});
  }
  const newUserBalance = getUserBalance() - requestedAmount;
  if (newUserBalance >= 0) {
    setUserBalance(newUserBalance);
  } else {
    setOverdraft(requestedAmount - getUserBalance());
    setUserBalance(0);
  }
  return response.contentType('application/json')
    .status(200)
    .json({ currentBalance: getUserBalance(), overdraft: getOverdraft() });
}


