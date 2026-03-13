interface FormErrorProps {
  message?: string;
  className?: string;
}

export function FormError({ message, className = "" }: FormErrorProps) {
  if (!message) return null;
  return <p className={`error-text ${className}`}>{message}</p>;
}
