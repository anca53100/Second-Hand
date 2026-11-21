import { useState } from 'react';

export default function useForm(initialValues, validate, onSubmit) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setValue = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleChange = (e) => setValue(e.target.name, e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate(values);
    setErrors(newErrors);
    setSubmitError('');
    if (Object.values(newErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      const fieldErrors = Object.fromEntries(
        Object.entries(err.errors ?? {}).filter(([name]) => name in values)
      );
      if (Object.keys(fieldErrors).length) setErrors((prev) => ({ ...prev, ...fieldErrors }));
      setSubmitError(err.message || 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return { values, errors, submitError, submitting, handleChange, setValue, handleSubmit };
}
