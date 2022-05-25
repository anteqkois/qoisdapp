import React from 'react';

const Input = ({ type, id, name, label, placeholder, onChange, value, error }) => {
  return (
    <div className="my-3">
      <label htmlFor={label} className="block mb-2 text-sm font-medium text-neutral-900">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        onChange={onChange}
        value={value}
        placeholder={placeholder}
        className={`block p-2 w-full text-neutral-900 bg-gray-50 rounded-lg border ${
          error ? 'border-red-600' : 'border-neutral-300'
        } outline-2 outline-offset-2 focus:outline-primary-300 focus:border-primary-800`}
      ></input>
      <p className="text-red-600 min-h-[24px]">{error && `* ${error}`}</p>
    </div>
  );
};

export default Input;
