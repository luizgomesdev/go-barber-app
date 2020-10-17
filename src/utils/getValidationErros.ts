import { ValidationError } from 'yup';

interface Erros {
    [key: string]: string;
}
export default function getValidationErros(error: ValidationError): Erros {
    const validationErros: Erros = {};
    
    error.inner.forEach(error => {
        validationErros[error.path] = error.message;
    });

    return validationErros;
}
