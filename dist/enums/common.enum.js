"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeType = exports.OTPType = exports.NotificationType = exports.TransactionStatus = exports.TransactionType = exports.PaymentMethodType = exports.TransferStatus = void 0;
var TransferStatus;
(function (TransferStatus) {
    TransferStatus["PENDING"] = "PENDING";
    TransferStatus["PROCESSING"] = "PROCESSING";
    TransferStatus["COMPLETED"] = "COMPLETED";
    TransferStatus["FAILED"] = "FAILED";
    TransferStatus["CANCELLED"] = "CANCELLED";
    TransferStatus["REFUNDED"] = "REFUNDED";
})(TransferStatus || (exports.TransferStatus = TransferStatus = {}));
var PaymentMethodType;
(function (PaymentMethodType) {
    PaymentMethodType["CARD"] = "CARD";
    PaymentMethodType["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethodType["MOBILE_MONEY"] = "MOBILE_MONEY";
    PaymentMethodType["CRYPTO"] = "CRYPTO";
})(PaymentMethodType || (exports.PaymentMethodType = PaymentMethodType = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["DEBIT"] = "DEBIT";
    TransactionType["CREDIT"] = "CREDIT";
    TransactionType["FEE"] = "FEE";
    TransactionType["REFUND"] = "REFUND";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["PROCESSING"] = "PROCESSING";
    TransactionStatus["COMPLETED"] = "COMPLETED";
    TransactionStatus["SUCCESS"] = "SUCCESS";
    TransactionStatus["FAILED"] = "FAILED";
    TransactionStatus["CANCELLED"] = "CANCELLED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["TRANSFER_SENT"] = "TRANSFER_SENT";
    NotificationType["TRANSFER_RECEIVED"] = "TRANSFER_RECEIVED";
    NotificationType["TRANSFER_COMPLETED"] = "TRANSFER_COMPLETED";
    NotificationType["TRANSFER_FAILED"] = "TRANSFER_FAILED";
    NotificationType["KYC_APPROVED"] = "KYC_APPROVED";
    NotificationType["KYC_REJECTED"] = "KYC_REJECTED";
    NotificationType["PAYMENT_REMINDER"] = "PAYMENT_REMINDER";
    NotificationType["SECURITY_ALERT"] = "SECURITY_ALERT";
    NotificationType["PAYMENT_METHOD_ADDED"] = "PAYMENT_METHOD_ADDED";
    NotificationType["SUBSCRIPTION_CANCELLED"] = "SUBSCRIPTION_CANCELLED";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var OTPType;
(function (OTPType) {
    OTPType["PASSWORD_RESET"] = "PASSWORD_RESET";
    OTPType["EMAIL_VERIFICATION"] = "EMAIL_VERIFICATION";
    OTPType["TWO_FACTOR_AUTH"] = "TWO_FACTOR_AUTH";
})(OTPType || (exports.OTPType = OTPType = {}));
var FeeType;
(function (FeeType) {
    FeeType["TRANSFER_FEE"] = "TRANSFER_FEE";
    FeeType["CURRENCY_CONVERSION_FEE"] = "CURRENCY_CONVERSION_FEE";
    FeeType["WITHDRAWAL_FEE"] = "WITHDRAWAL_FEE";
    FeeType["CARD_PROCESSING_FEE"] = "CARD_PROCESSING_FEE";
})(FeeType || (exports.FeeType = FeeType = {}));
//# sourceMappingURL=common.enum.js.map