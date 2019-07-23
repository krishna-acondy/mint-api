let currentUserBalance = 500;
let overdraft = 0;
const currentAtmBalance = [
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

export const getCurrentAtmBalance = () => {
  let total = 0;
  currentAtmBalance.forEach(denomination => {
    total += denomination.value * denomination.quantity;
  });

  return total;
}