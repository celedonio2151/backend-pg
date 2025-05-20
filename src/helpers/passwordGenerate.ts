export function passwordGenerate() {
  const numbers = '0123456789';
  const upperCaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // Generar 4-5 números aleatorios
  let password = '';
  for (let i = 0; i < 4; i++) {
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  // Añadir 1-2 letras mayúsculas aleatorias
  for (let i = 0; i < 2; i++) {
    password += upperCaseLetters.charAt(
      Math.floor(Math.random() * upperCaseLetters.length),
    );
  }

  // Mezclar la contraseña para que no estén las letras mayúsculas siempre al final
  return password
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');
}
