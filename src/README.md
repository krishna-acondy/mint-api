# Mint API
This project is an API built using `ts-node` with `Express`. It is hosted on the Heroku cloud at [Mint API](https://mnt-api.herokuapp.com/api).

# Endpoints
## PIN Authentication
This endpoint can be accessed at `/pin`, and takes a request body that contains a PIN:
```
    {
        pin: 1234
    }
```

## PIN Authentication
This endpoint can be accessed at `/withdraw`, and takes a request body that contains the amount:
```
    {
        amount:50
    }
```
The API dispenses a mix of notes in different denominations when available.

On successful withdrawal, it returns a 200 status code with the following response body:
```
    {
        currentBalance: 450,
        overdraft: 0,
        noteMix: {
            numberOfFives: 2,
            numberOfTens: 2,
            numberOfTwenties: 1
        }
    }
```

There are multiple error conditions:
* When the ATM has run out of funds, it returns a 500(Internal Server Error) status code with the following response body:
```
    {
        error: "Insufficient ATM Balance"
    }
```

* When the maximum overdraft has been reached, it returns a 403(Forbidden) status code with the following response body:
```
    {
        error: "Maximum overdraft reached"
    }
```

* When the user asks to withdraw an invalid amount, it returns a 406(Not Acceptable) status code with the following response body:
```
    {
        error: "Invalid amount"
    }
```