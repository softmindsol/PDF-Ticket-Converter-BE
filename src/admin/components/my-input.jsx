// src/admin/components/my-input.jsx
import React from 'react';

// Define a simple custom input component
const MyInputComponent = (props) => {
  return (
    <input
      type="text"
      value={props.value} className='dfjn'
      onChange={(e) => props.onChange(e.target.value)}
      placeholder="Custom Input"
      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
    />
  );
}

export default MyInputComponent;
