export const formatPhoneNumber = (phone) => {
  if (phone.startsWith("0")) return `+972${phone.slice(1)}`;
  if (phone.startsWith("5")) return `+972${phone}`;
  return phone;
};

export const validatePhoneNumber = (phone, guestsList) => {
  const formattedPhone = formatPhoneNumber(phone);
  const phoneRegex = /^\+9725\d{8}$/;
  if (!phoneRegex.test(formattedPhone)) {
    alert(
      "Invalid phone number format. Please enter a valid Israeli phone number. you can enter it as 05XXXXXXXX or 5XXXXXXXX or +9725XXXXXXXX"
    );
    return;
  }

  if (guestsList.some((guest) => guest.Phone === formattedPhone)) {
    alert("a guest with this phone number already exists in the list");
    return;
  }
  return formattedPhone;
};
