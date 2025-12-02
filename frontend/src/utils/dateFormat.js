export const formatAndValidateDate = (input) => {
  let digits = input.replace(/\D/g, "").slice(0, 8);

  let formatted = digits
    .replace(/^(\d{0,2})/, "$1")
    .replace(/^(\d{2})(\d)/, "$1/$2")
    .replace(/^(\d{2}\/\d{2})(\d)/, "$1/$2")
    .replace(/^(\d{2}\/\d{2}\/\d{4}).*/, "$1");

  if (formatted.length === 10) {
    const [d, m, y] = formatted.split("/").map(Number);

    if (m < 1 || m > 12) {
      formatted = formatted.substring(0, 3) + "12" + formatted.substring(5);
    }

    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let maxDay = daysInMonth[m - 1];

    if (m === 2) {
      const isLeapYear = (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
      maxDay = isLeapYear ? 29 : 28;
    }

    if (d > maxDay) {
      formatted = formatted.substring(0, 0) + 
                  String(maxDay).padStart(2, "0") + 
                  formatted.substring(2);
    }

    if (y < 1900 || y > 2100) {
      formatted = formatted.substring(0, 6) + "2000";
    }
  }

  return formatted;
};