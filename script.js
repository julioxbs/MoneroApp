"use strict";

const account1 = {
  owner: "Julio Cesar",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-05-27T17:01:17.194Z",
    "2020-07-11T23:36:17.929Z",
    "2020-07-12T10:51:36.790Z",
  ],
  currency: "BRL",
  locale: "pt-BR",
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
  movementsDates: [
    "2018-11-18T21:31:17.178Z",
    "2018-12-23T07:42:02.383Z",
    "2017-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-05-27T17:01:17.194Z",
    "2020-07-11T23:36:17.929Z",
    "2020-07-12T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "en-US",
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2021-01-28T09:15:04.904Z",
    "2021-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-05-27T17:01:17.194Z",
    "2020-07-11T23:36:17.929Z",
    "2020-07-12T10:51:36.790Z",
  ],
  currency: "BRL",
  locale: "pt-BR",
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");
const modal = document.querySelector(".modal");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

//////////////////////////////////////////////////////////////
// LOGIN EVENT
let currentAccount;

btnLogin.addEventListener("click", (e) => {
  e.preventDefault();

  // LOGOUT TIMER
  startlogOutTimer()

  currentAccount = accounts.find((acc) => {
    return acc.username === inputLoginUsername.value;
  });
  
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and Message
    modal.classList.add("modal-close");
    labelWelcome.textContent = `Bem-vindo novamente, ${currentAccount.owner}`;

    // Create current date and time
    const now = new Date();
    const options = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // Clear input fields
    inputLoginPin.value = inputLoginUsername.value = "";

    // Update UI
    updateUI(currentAccount);
  } else {
    alert("Usuário e PIN, precisam ser preenchidos corretamente.");
  }
});

//////////////////////////////////////////////////////////////
// MOVEMENTS DISPLAY
const formatMovementDate = function (date, locale) {
  const calcDays = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDays((new Date(), date));

  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const displayMovements = function (account) {
  account.movements.map((value, index) => {
    const type = value > 0 ? "deposit" : "withdrawal";
    const typePT = value > 0 ? "depositado" : "retirado";

    const date = new Date(account.movementsDates[index]);
    const displayDate = formatMovementDate(date, account.locale);

    const formattedMov = formatCur(value, account.locale, account.currency);
    
    const html = `
    <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      index + 1
    } ${typePT}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
    </div>
    `;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

//////////////////////////////////////////////////////////////
// SUM OF BALANCE
const calcPrintBalance = function (user) {
  user.sumOfBalance = user.movements.reduce((accum, value) => {
    return accum + value;
  }, 0);

  labelBalance.textContent = `${formatCur(user.sumOfBalance, user.locale, user.currency)}`;
};

//////////////////////////////////////////////////////////////
// CALCULATE SUMMARY
const calcDisplaySummary = function (user) {
  let deposits = user.movements
    .filter((value) => {
      return value > 0;
    })
    .reduce((accum, value) => {
      return accum + value;
    }, 0);

  labelSumIn.textContent = `${formatCur(deposits, user.locale, user.currency)}`;

  let withdrawal = user.movements
    .filter((value) => {
      return value < 0;
    })
    .reduce((accum, value) => {
      return accum + value;
    }, 0);

  labelSumOut.textContent = `${formatCur(withdrawal, user.locale, user.currency)}`;

  let interest = user.movements
    .filter((value) => {
      return value > 0;
    })
    .map((deposit) => {
      return (deposit * user.interestRate) / 100;
    })
    .reduce((accum, value) => {
      return accum + value;
    }, 0);

  labelSumInterest.textContent = `${formatCur(interest, user.locale, user.currency)}`;
};

//////////////////////////////////////////////////////////////
// ABBREVIATE USERNAMES
const abbreviateUsers = function (accs) {
  accs.forEach((acc) => {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};

abbreviateUsers(accounts);

//////////////////////////////////////////////////////////////
// FORMATING CURRENCY
const formatCur = function (value, locale, currency) {
  const options = {
    style: "currency",
    currency: currency,
  };

  return new Intl.NumberFormat(locale, options).format(value);
};

//////////////////////////////////////////////////////////////
// UPDATING USERS
const updateUI = function (user) {
  // Display Movements
  displayMovements(currentAccount);
  // Display Balance
  calcPrintBalance(currentAccount);
  // Display Summary
  calcDisplaySummary(currentAccount);
};

//////////////////////////////////////////////////////////////
// TIMER TO LOGGOUT

const startlogOutTimer = function() {
  let timer = 600;

  setInterval(() => {
    const min = String(Math.trunc(timer / 60)).padStart(2, 0);
    const sec = String(timer % 60).padStart(2, 0);

    labelTimer.textContent = `${min}:${sec}`;

    if (timer === 0) {
      timer = '00:00'
      location.reload()
    }

    timer--

  }, 1000);
}

//////////////////////////////////////////////////////////////
// TRANSFER MONEY
btnTransfer.addEventListener("click", (e) => {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find((acc) => {
    return acc.username === inputTransferTo.value;
  });

  console.log(amount, receiverAcc);
  // Clear Inputs
  inputTransferTo.value = inputTransferAmount.value = "";

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.sumOfBalance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing Transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date());
    receiverAcc.movementsDates.push(new Date());

    // Update UI
    updateUI(currentAccount);
  }
});

//////////////////////////////////////////////////////////////
// REQUEST LOAN
btnLoan.addEventListener("click", (e) => {
  e.preventDefault();

  const loanAmount = Number(inputLoanAmount.value);

  if (
    loanAmount > 0 &&
    currentAccount.movements.some((mov) => {
      return mov >= loanAmount * 0.1;
    })
  ) {
    setTimeout(() => {
      // Add Movement
    currentAccount.movements.push(loanAmount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date());

    // Update UI
    updateUI(currentAccount);
    }, 2500)
  }

  inputLoanAmount.value = "";
});

//////////////////////////////////////////////////////////////
// CLOSE ACCOUNT
btnClose.addEventListener("click", (e) => {
  e.preventDefault();

  if (
    Number(inputClosePin.value) === currentAccount.pin &&
    inputCloseUsername.value === currentAccount.username
  ) {
    const index = accounts.findIndex((acc) => {
      return acc.username === currentAccount.username;
    });

    // Delete Account
    accounts.splice(index, 1);

    // Hide UI
    modal.classList.remove("modal-close");

    // Clear Inputs
    inputCloseUsername.value = inputClosePin.value = "";
  }
});