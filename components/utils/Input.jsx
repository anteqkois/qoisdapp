import React from 'react';

const Input = ({ type, id, name, label, placeholder, onChange, value, error }) => {
  return (
    <div className="my-3">
      <label htmlFor={label} className="block mb-2 text-sm font-medium text-gray-900">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        onChange={onChange}
        value={value}
        placeholder={placeholder}
        className="block p-2 w-full text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
      ></input>
    </div>
  );
};

export default Input;
