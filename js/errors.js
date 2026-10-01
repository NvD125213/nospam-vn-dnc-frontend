(function (global) {
  var ERROR_MESSAGES = {
    ERROR_CLIENT_ID_MISSING: "Thiếu client ID",
    ERROR_SECRET_KEY_MISSING: "Thiếu Secret key",
    ERROR_PARTNER_CODE_MISSING: "Thiếu mã đối tác",
    ERROR_PARTNER_INCORRECT: "Mã đối tác không đúng",
    SOMETHING_WENT_WRONG: "Lỗi không xác định",
    ERROR_PHONE_MISSING: "Thiếu số điện thoại",
    ERROR_PHONE_NUMBER_MISSING: "Thiếu số điện thoại",
    ERROR_REFLECT_FORM_CODE_MISSING: "Thiếu nguồn phản ánh",
    ERROR_REFLECT_FORM_CODE_INVALID: "Nguồn phản ánh sai giá trị",
    ERROR_REFLECT_TYPE_CODE_MISSING: "Thiếu loại phản ánh",
    ERROR_REFLECT_TYPE_CODE_INVALID: "Loại phản ánh sai giá trị",
    ERROR_REQUEST_TYPE_MISSING: "Thiếu loại yêu cầu",
    ERROR_REQUEST_TYPE_INVALID: "Loại yêu cầu sai giá trị",
    ERROR_TEL_PARTNER_CODE_MISSING: "Thiếu thuê bao cập nhật",
    ERROR_PHONE_NUMBER_NOT_FOUND: "Thuê bao không nằm trong kho DNC",
    ERROR_PHONE_NUMBER_NOT_EXISTS: "Thuê bao không thuộc nhà mạng quản lý",
    ERROR_REQUEST_ID_MISSING: "Thiếu ID đối soát",
    ERROR_OWNER_PHONE_MISSING:
      "Thiếu số thuê bao phản ánh tin nhắn/cuộc gọi rác",
    ERROR_PREFIX_NUMBER_MISSING:
      "Thiếu số thuê bao bị phản ánh tin nhắn/cuộc gọi rác",
    ERROR_COMPLAIN_TYPE_MISSING: "Thiếu loại phản ánh tin nhắn/cuộc gọi rác",
    ERROR_SIGNATURE_MISSING: "Thiếu chữ ký",
    ERROR_SIGNATURE_INCORRECT: "Sai chữ ký",
  };

  function describeError(code) {
    var key = String(code == null ? "" : code).trim();
    if (!key) return "";
    if (ERROR_MESSAGES[key]) return ERROR_MESSAGES[key];
    return key;
  }

  function describeErrors(codes) {
    var list = Array.isArray(codes) ? codes : codes == null ? [] : [codes];
    return list
      .map(describeError)
      .filter(Boolean);
  }

  global.CGV_ERRORS = ERROR_MESSAGES;
  global.describeError = describeError;
  global.describeErrors = describeErrors;
})(typeof window !== "undefined" ? window : globalThis);
