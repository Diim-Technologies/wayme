"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisputePriority = exports.DisputeCategory = exports.DisputeStatus = void 0;
var DisputeStatus;
(function (DisputeStatus) {
    DisputeStatus["OPEN"] = "OPEN";
    DisputeStatus["IN_PROGRESS"] = "IN_PROGRESS";
    DisputeStatus["RESOLVED"] = "RESOLVED";
    DisputeStatus["CLOSED"] = "CLOSED";
})(DisputeStatus || (exports.DisputeStatus = DisputeStatus = {}));
var DisputeCategory;
(function (DisputeCategory) {
    DisputeCategory["WRONG_AMOUNT"] = "WRONG_AMOUNT";
    DisputeCategory["DELAYED_TRANSFER"] = "DELAYED_TRANSFER";
    DisputeCategory["UNAUTHORIZED"] = "UNAUTHORIZED";
    DisputeCategory["FAILED_TRANSACTION"] = "FAILED_TRANSACTION";
    DisputeCategory["POOR_SERVICE"] = "POOR_SERVICE";
    DisputeCategory["OTHER"] = "OTHER";
})(DisputeCategory || (exports.DisputeCategory = DisputeCategory = {}));
var DisputePriority;
(function (DisputePriority) {
    DisputePriority["LOW"] = "LOW";
    DisputePriority["MEDIUM"] = "MEDIUM";
    DisputePriority["HIGH"] = "HIGH";
})(DisputePriority || (exports.DisputePriority = DisputePriority = {}));
//# sourceMappingURL=dispute.enum.js.map