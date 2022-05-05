export const calculateInstallmentInterestRateHDSaiGon = (
  amount,
  prepaidPercentage,
  tenor,
) => {
  let prepaidAmount = (amount * prepaidPercentage) / 100;
  let restAmount = amount - prepaidAmount;
  let interestRate = 1.89;
  let accInterestRate = 0.42;
  let periodAmount =
    (restAmount * interestRate) / 100 +
    restAmount / tenor +
    (restAmount * accInterestRate) / 100 +
    12;

  let totalInterest = periodAmount * tenor - restAmount;
  let interestPerMonth = totalInterest / tenor;

  return {
    price: +amount,
    tenor: +tenor,
    prepaidAmount,
    paymentPerMonth: periodAmount,
    restAmount,
    interestPerMonth,
    totalInterest,
    totalPriceAfterInstallment: +amount + totalInterest,
  };
};

/*
 * ir   - interest rate per month
 * np   - number of periods (months)
 * pv   - present value
 * fv   - future value
 * type - when the payments are due:
 *        0: end of the period, e.g. end of month (default)
 *        1: beginning of period
 */
export function PMT(ir, np, pv, fv = 0, type = 0) {
  var pmt, pvif;

  fv || (fv = 0);
  type || (type = 0);

  if (ir === 0) return -(pv + fv) / np;

  pvif = Math.pow(1 + ir, np);
  pmt = (-ir * (pv * pvif + fv)) / (pvif - 1);

  if (type === 1) pmt /= 1 + ir;

  return pmt;
}

export const calculateInstallmentInterestRateHomeCredit = (
  amount,
  prepaidPercentage,
  tenor,
) => {
  let prepaidAmount = (amount * prepaidPercentage) / 100;

  let restAmount = amount - prepaidAmount;

  let interestRate = 3.75;
  let paymentPerMonthBeforeOtherFees = PMT(
    interestRate / 100,
    tenor,
    -restAmount,
  );

  let warrantyDuration = tenor * 30 + 14;
  let warrantyAmount = restAmount * 2.5;

  let warrantyFeePerYear = (warrantyAmount * 2.4) / 100;
  let warrantyInTerm = (warrantyFeePerYear / 365) * warrantyDuration;
  let warrantyFeePerMonth = warrantyInTerm / tenor;
  let collectionFee = 11000;
  let paymentPerMonthAfterOtherFees =
    paymentPerMonthBeforeOtherFees + collectionFee + warrantyFeePerMonth;

  return {
    price: +amount,
    tenor: +tenor,
    prepaidAmount,
    paymentPerMonth: paymentPerMonthAfterOtherFees,
    restAmount,
    warrantyFeePerMonth,
    totalPriceAfterInstallment: +(
      paymentPerMonthAfterOtherFees * tenor +
      prepaidAmount
    ),
  };
};

export const PaymentStatus = {
  new: 1,
  success: 2,
  failed: 3,
};
