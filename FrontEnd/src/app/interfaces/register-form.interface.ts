export interface registerForm {
  name: string;
  email: string;
  password: string;
  repassword: string;
  cif?: string;
  accept: boolean; //esto es el campo de terminos y condiciones
}
