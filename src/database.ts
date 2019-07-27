import cloneDeep from 'lodash.clonedeep';

let currentUserBalance = 500;
let overdraft = 0;
const currentAtmDenominations = [
  { value: 5, quantity: 4 },
  { value: 10, quantity: 15 },
  { value: 20, quantity: 7 },
];

export const getUserBalance = () => currentUserBalance;

export const setUserBalance = (amount: number) => {
  currentUserBalance = amount;
}

export const getOverdraft = () => overdraft;

export const setOverdraft = (amount: number) => {
  overdraft = amount;
}

export const getAvailableDenominations = () => cloneDeep(currentAtmDenominations);

export const setAvailableDenominations =
  (noteMix: {value: number, quantity: number}[]) => {
    currentAtmDenominations[0].quantity -= noteMix[0].quantity;
    currentAtmDenominations[1].quantity -= noteMix[1].quantity;;
    currentAtmDenominations[2].quantity -= noteMix[2].quantity;;
  }

export const getCurrentAtmBalance = () => {
  let total = 0;
  currentAtmDenominations.forEach(denomination => {
    total += denomination.value * denomination.quantity;
  });

  return total;
}
