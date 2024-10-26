import React, { useState, useEffect } from 'react';

interface AlertProps {
  message: string;
  duration?: number; // Duration for how long the alert should be visible
}

const Alert: React.FC<AlertProps & { bgColor: string; borderColor: string; textColor: string; hoverBgColor: string; iconColor: string }> = ({
  bgColor,
  borderColor,
  textColor,
  hoverBgColor,
  iconColor,
  message,
  duration = 3000, // Default duration of 3 seconds
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div
      role="alert"
      className={`${bgColor} ${borderColor} ${textColor} p-2 rounded-lg flex items-center transition duration-300 ease-in-out ${hoverBgColor} transform hover:scale-105 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <svg
        stroke="currentColor"
        viewBox="0 0 24 24"
        fill="none"
        className={`h-5 w-5 flex-shrink-0 mr-2 ${iconColor}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        ></path>
      </svg>
      <p className="text-xs font-semibold">{message}</p>
    </div>
  );
};

export const SuccessAlert: React.FC<AlertProps> = ({ message, duration }) => (
  <Alert
    bgColor="bg-green-100 dark:bg-green-900"
    borderColor="border-l-4 border-green-500 dark:border-green-700"
    textColor="text-green-900 dark:text-green-100"
    hoverBgColor="hover:bg-green-200 dark:hover:bg-green-800"
    iconColor="text-green-600"
    message={message}
    duration={duration}
  />
);

export const InfoAlert: React.FC<AlertProps> = ({ message, duration }) => (
  <Alert
    bgColor="bg-blue-100 dark:bg-blue-900"
    borderColor="border-l-4 border-blue-500 dark:border-blue-700"
    textColor="text-blue-900 dark:text-blue-100"
    hoverBgColor="hover:bg-blue-200 dark:hover:bg-blue-800"
    iconColor="text-blue-600"
    message={message}
    duration={duration}
  />
);

export const WarningAlert: React.FC<AlertProps> = ({ message, duration }) => (
  <Alert
    bgColor="bg-yellow-100 dark:bg-yellow-900"
    borderColor="border-l-4 border-yellow-500 dark:border-yellow-700"
    textColor="text-yellow-900 dark:text-yellow-100"
    hoverBgColor="hover:bg-yellow-200 dark:hover:bg-yellow-800"
    iconColor="text-yellow-600"
    message={message}
    duration={duration}
  />
);

export const ErrorAlert: React.FC<AlertProps> = ({ message, duration }) => (
  <Alert
    bgColor="bg-red-100 dark:bg-red-900"
    borderColor="border-l-4 border-red-500 dark:border-red-700"
    textColor="text-red-900 dark:text-red-100"
    hoverBgColor="hover:bg-red-200 dark:hover:bg-red-800"
    iconColor="text-red-600"
    message={message}
    duration={duration}
  />
);

export default function Notify() {
  return (
    <div className="space-y-2 p-4">
      <SuccessAlert message="Success - Everything went smoothly!" duration={3000} />
      <InfoAlert message="Info - This is some information for you." duration={3000} />
      <WarningAlert message="Warning - Be careful with this next step." duration={3000} />
      <ErrorAlert message="Error - Something went wrong." duration={3000} />
    </div>
  );
}
