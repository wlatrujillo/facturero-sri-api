export class CedulaValidator {

  public static isValid(cedula: string): boolean {
    if (!/^\d{10}$/.test(cedula)) {
      return false;
    }

    const digits = cedula.split("").map(Number);
    const provinceCode = parseInt(cedula.substring(0, 2), 10);
    if (provinceCode < 1 || provinceCode > 24) {
      return false;
    }

    const thirdDigit = digits[2];
    if (thirdDigit < 0 || thirdDigit > 5) {
      return false;
    }

    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let sum = 0;

    for (let i = 0; i < coefficients.length; i++) {
      let product = digits[i] * coefficients[i];
      if (product >= 10) {
        product -= 9;
        }
        sum += product;
    }

    const verifierDigit = (10 - (sum % 10)) % 10;

    return verifierDigit === digits[9];
  }
}