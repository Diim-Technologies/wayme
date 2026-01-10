"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var KycStatus;
(function (KycStatus) {
    KycStatus["PENDING"] = "PENDING";
    KycStatus["APPROVED"] = "APPROVED";
    KycStatus["REJECTED"] = "REJECTED";
    KycStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
})(KycStatus || (exports.KycStatus = KycStatus = {}));
//# sourceMappingURL=user.enum.js.map