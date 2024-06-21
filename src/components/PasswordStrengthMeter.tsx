import React from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

const getPasswordStrength = (password: string) => {
  let strength = 0;
  if (password.length > 8) strength += 1;
  if (password.length > 12) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  return strength;
};

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const strength = getPasswordStrength(password);
  const strengthText = ["Weak", "Fair", "Good", "Strong", "Very Strong"][strength];
  const strengthColor = ["#ff4d4d", "#ff944d", "#ffff4d", "#94ff4d", "#4dff4d"][strength];

  return (
    <div>
      <p>Password Strength: <span style={{ color: strengthColor }}>{strengthText}</span></p>
      <progress value={strength} max="5"></progress>
    </div>
  );
};

export default PasswordStrengthMeter;
